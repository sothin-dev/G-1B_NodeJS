// src/services/enrollment.service.ts
import { AppDataSource } from '../config/database'
import { Enrollment, EnrollmentStatus } from '../entities/enrollment.entity'
import { EnrollmentCourse } from '../entities/enrollment-course.entity'
import { Course } from '../entities/course.entity'
import { Schedule } from '../entities/schedule.entity'
import { Semester } from '../entities/semester.entity'
import { Student } from '../entities/student.entity'
import { AppError } from '../core/errors/app-error'

const MAX_CREDITS = 18

export class EnrollmentService {
  private enrollmentRepo = AppDataSource.getRepository(Enrollment)
  private enrollmentCourseRepo = AppDataSource.getRepository(EnrollmentCourse)
  private courseRepo = AppDataSource.getRepository(Course)
  private semesterRepo = AppDataSource.getRepository(Semester)
  private studentRepo = AppDataSource.getRepository(Student)

  async listEnrollments(filters: { studentId?: string; semesterId?: string; status?: string } = {}) {
    const query = this.enrollmentRepo.createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('enrollment.semester', 'semester')
      .leftJoinAndSelect('enrollment.enrollmentCourses', 'enrollmentCourses')
      .leftJoinAndSelect('enrollmentCourses.course', 'course')
      .orderBy('enrollment.created_at', 'DESC')

    if (filters.studentId) query.andWhere('enrollment.studentId = :studentId', { studentId: filters.studentId })
    if (filters.semesterId) query.andWhere('enrollment.semesterId = :semesterId', { semesterId: filters.semesterId })
    if (filters.status) query.andWhere('enrollment.status = :status', { status: filters.status })

    return query.getMany()
  }

  async getEnrollment(enrollmentId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['student', 'student.user', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
    })

    if (!enrollment) throw new AppError('Enrollment not found', 404)
    return enrollment
  }

  // ─── Enroll student in courses ───────────────────────────────────────────

  async enroll(studentId: string, semesterId: string, courseIds: string[]): Promise<Enrollment> {

    // 1. Validate student exists and is ACTIVE
    const student = await this.studentRepo.findOne({ where: { id: studentId } })
    if (!student) throw new AppError('Student not found', 404)
    if (student.status !== 'ACTIVE') {
      throw new AppError(`Cannot enroll — student status is ${student.status}`, 403)
    }

    // 2. Validate semester is ACTIVE
    const semester = await this.semesterRepo.findOne({ where: { id: semesterId } })
    if (!semester) throw new AppError('Semester not found', 404)
    if (semester.status !== 'ACTIVE') {
      throw new AppError(`Cannot enroll — semester is ${semester.status}`, 403)
    }

    // 3. Load requested courses with their schedules
    const courses = await this.courseRepo.find({
      where: courseIds.map((id) => ({ id })),
      relations: ['schedules'],
    })

    if (courses.length !== courseIds.length) {
      throw new AppError('One or more courses not found', 404)
    }

    // 4. Validate credit limit
    const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0)
    if (totalCredits > MAX_CREDITS) {
      throw new AppError(
        `Total credits (${totalCredits}) exceeds the maximum allowed (${MAX_CREDITS})`,
        400
      )
    }

    // 5. Check for duplicate enrollment in same semester
    const existing = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, semester: { id: semesterId } },
      relations: ['enrollmentCourses', 'enrollmentCourses.course'],
    })
    if (existing) {
      const alreadyEnrolled = existing.enrollmentCourses.map((ec) => ec.course.id)
      const duplicate = courseIds.find((id) => alreadyEnrolled.includes(id))
      if (duplicate) {
        throw new AppError(`Already enrolled in course ID ${duplicate} this semester`, 409)
      }
    }

    // 6. Validate schedule conflicts (new courses vs each other)
    this.validateScheduleConflicts(courses)

    // 7. If student already has an enrollment this semester, also check
    //    new courses against already-enrolled course schedules
    if (existing) {
      const existingCourses = existing.enrollmentCourses.map((ec) => ec.course)
      const existingWithSchedules = await this.courseRepo.find({
        where: existingCourses.map((c) => ({ id: c.id })),
        relations: ['schedules'],
      })
      this.validateScheduleConflicts([...existingWithSchedules, ...courses])
    }

    // 8. Create enrollment record
    const enrollment = this.enrollmentRepo.create({
      student: { id: studentId },
      semester: { id: semesterId },
      status: EnrollmentStatus.PENDING,
      total_credits: totalCredits,
    })
    const savedEnrollment = await this.enrollmentRepo.save(enrollment)

    // 9. Create enrollment_courses join records
    const enrollmentCourses = courses.map((course) =>
      this.enrollmentCourseRepo.create({
        enrollment: savedEnrollment,
        course,
      })
    )
    await this.enrollmentCourseRepo.save(enrollmentCourses)

    return savedEnrollment
  }

  // ─── Approve enrollment ───────────────────────────────────────────────────

  async approve(enrollmentId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['enrollmentCourses', 'enrollmentCourses.course'],
    })
    if (!enrollment) throw new AppError('Enrollment not found', 404)
    if (enrollment.status !== 'PENDING') {
      throw new AppError(`Cannot approve — enrollment is already ${enrollment.status}`, 400)
    }

    // Check course capacities
    for (const ec of enrollment.enrollmentCourses) {
      const course = ec.course
      const enrolledCount = await this.enrollmentCourseRepo.count({
        where: { course: { id: course.id } },
      })
      if (enrolledCount >= course.capacity) {
        throw new AppError(`Course "${course.name}" is full (capacity: ${course.capacity})`, 409)
      }
    }

    enrollment.status = EnrollmentStatus.APPROVED
    return this.enrollmentRepo.save(enrollment)
  }

  async reject(enrollmentId: string, reason?: string): Promise<Enrollment> {
    const enrollment = await this.getEnrollment(enrollmentId)

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new AppError(`Cannot reject — enrollment is already ${enrollment.status}`, 400)
    }

    enrollment.status = EnrollmentStatus.REJECTED
    if (reason) {
      ;(enrollment as Enrollment & { rejectionReason?: string }).rejectionReason = reason
    }

    return this.enrollmentRepo.save(enrollment)
  }

  // ─── Cancel enrollment ────────────────────────────────────────────────────

  async cancel(enrollmentId: string, studentId?: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: studentId ? { id: enrollmentId, student: { id: studentId } } : { id: enrollmentId },
      relations: ['student'],
    })
    if (!enrollment) throw new AppError('Enrollment not found', 404)
    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new AppError('Enrollment is already cancelled', 400)
    }

    enrollment.status = EnrollmentStatus.CANCELLED
    return this.enrollmentRepo.save(enrollment)
  }

  async bulkApprove(enrollmentIds: string[]): Promise<Enrollment[]> {
    const results: Enrollment[] = []

    for (const id of enrollmentIds) {
      results.push(await this.approve(id))
    }

    return results
  }

  async validateSelection(studentId: string, semesterId: string, courseIds: string[]) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } })
    if (!student) throw new AppError('Student not found', 404)

    const semester = await this.semesterRepo.findOne({ where: { id: semesterId } })
    if (!semester) throw new AppError('Semester not found', 404)

    const courses = await this.courseRepo.find({
      where: courseIds.map((id) => ({ id })),
      relations: ['schedules'],
    })

    if (courses.length !== courseIds.length) {
      throw new AppError('One or more courses not found', 404)
    }

    const totalCredits = courses.reduce((sum, course) => sum + course.credit, 0)
    if (totalCredits > MAX_CREDITS) {
      throw new AppError(`Total credits (${totalCredits}) exceeds the maximum allowed (${MAX_CREDITS})`, 400)
    }

    this.validateScheduleConflicts(courses)

    return {
      valid: true,
      totalCredits,
      courseCount: courses.length,
      semester,
      student,
    }
  }

  async getEnrollmentCourses(enrollmentId: string) {
    const enrollment = await this.getEnrollment(enrollmentId)
    return enrollment.enrollmentCourses?.map((item) => item.course) ?? []
  }

  // ─── Get student's enrolled courses ──────────────────────────────────────

  async getMyCourses(studentId: string, semesterId?: string): Promise<Enrollment | null> {
    return this.enrollmentRepo.findOne({
      where: semesterId
        ? { student: { id: studentId }, semester: { id: semesterId } }
        : { student: { id: studentId } },
      relations: [
        'enrollmentCourses',
        'enrollmentCourses.course',
        'enrollmentCourses.course.schedules',
      ],
      order: { created_at: 'DESC' },
    })
  }

  // ─── Schedule conflict validator ──────────────────────────────────────────

  private validateScheduleConflicts(courses: Course[]): void {
    const schedules: Array<{ schedule: Schedule; courseName: string }> = []

    for (const course of courses) {
      for (const schedule of course.schedules) {
        schedules.push({ schedule, courseName: course.name })
      }
    }

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i]
        const b = schedules[j]

        if (a.schedule.day === b.schedule.day && this.timesOverlap(a.schedule, b.schedule)) {
          throw new AppError(
            `Schedule conflict: "${a.courseName}" and "${b.courseName}" ` +
            `overlap on ${a.schedule.day} ` +
            `(${a.schedule.start_time}–${a.schedule.end_time} vs ` +
            `${b.schedule.start_time}–${b.schedule.end_time})`,
            409
          )
        }
      }
    }
  }

  private timesOverlap(a: Schedule, b: Schedule): boolean {
    const toMinutes = (time: string): number => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }

    const aStart = toMinutes(a.start_time)
    const aEnd = toMinutes(a.end_time)
    const bStart = toMinutes(b.start_time)
    const bEnd = toMinutes(b.end_time)

    // Overlap if one starts before the other ends
    return aStart < bEnd && bStart < aEnd
  }
}