import { AppDataSource } from '../config/database'
import { Enrollment, EnrollmentStatus } from '../entities/enrollment.entity'
import { EnrollmentCourse } from '../entities/enrollment-course.entity'
import { Course } from '../entities/course.entity'
import { Schedule } from '../entities/schedule.entity'
import { Semester, SemesterStatus } from '../entities/semester.entity'
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
      .leftJoinAndSelect('student.department', 'studentDept')
      .leftJoinAndSelect('enrollment.semester', 'semester')
      .leftJoinAndSelect('enrollment.enrollmentCourses', 'enrollmentCourses')
      .leftJoinAndSelect('enrollmentCourses.course', 'course')
      .leftJoinAndSelect('course.department', 'courseDept')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('teacher.user', 'teacherUser')
      .orderBy('enrollment.created_at', 'DESC')

    if (filters.studentId) query.andWhere('enrollment.studentId = :studentId', { studentId: filters.studentId })
    if (filters.semesterId) query.andWhere('enrollment.semesterId = :semesterId', { semesterId: filters.semesterId })
    if (filters.status) query.andWhere('enrollment.status = :status', { status: filters.status })

    return query.getMany()
  }

  async getEnrollment(enrollmentId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: [
        'student',
        'student.user',
        'student.department',
        'semester',
        'enrollmentCourses',
        'enrollmentCourses.course',
        'enrollmentCourses.course.department',
        'enrollmentCourses.course.teacher',
        'enrollmentCourses.course.teacher.user',
      ],
    })

    if (!enrollment) throw new AppError('Enrollment not found', 404)
    return enrollment
  }

  async enroll(studentId: string, semesterId?: string, courseIds: string[] = []): Promise<Enrollment> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } })
    if (!student) throw new AppError('Student not found', 404)
    if (student.status !== 'ACTIVE') {
      throw new AppError(`Cannot enroll — student status is ${student.status}`, 403)
    }

    let targetSemesterId = semesterId;
    if (!targetSemesterId) {
      const activeSem = await this.semesterRepo.findOne({ where: { status: SemesterStatus.ACTIVE } });
      if (!activeSem) {
        throw new AppError('No active semester found for enrollment', 400);
      }
      targetSemesterId = activeSem.id;
    }

    const semester = await this.semesterRepo.findOne({ where: { id: targetSemesterId } })
    if (!semester) throw new AppError('Semester not found', 404)
    if (semester.status !== 'ACTIVE') {
      throw new AppError(`Cannot enroll — semester is ${semester.status}`, 403)
    }

    if (!courseIds || courseIds.length === 0) {
      throw new AppError('At least one course must be selected for enrollment', 400);
    }

    const courses = await this.courseRepo.find({
      where: courseIds.map((id) => ({ id })),
      relations: ['schedules'],
    })

    if (courses.length !== courseIds.length) {
      throw new AppError('One or more courses not found', 404)
    }

    const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0)
    if (totalCredits > MAX_CREDITS) {
      throw new AppError(
        `Total credits (${totalCredits}) exceeds the maximum allowed (${MAX_CREDITS})`,
        400
      )
    }

    const existing = await this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, semester: { id: targetSemesterId } },
      relations: ['enrollmentCourses', 'enrollmentCourses.course'],
    })
    if (existing && existing.status !== EnrollmentStatus.CANCELLED && existing.status !== EnrollmentStatus.REJECTED) {
      const alreadyEnrolled = (existing.enrollmentCourses || []).map((ec) => ec.course?.id).filter(Boolean)
      const duplicate = courseIds.find((id) => alreadyEnrolled.includes(id))
      if (duplicate) {
        throw new AppError(`Already enrolled in course ID ${duplicate} this semester`, 409)
      }
    }

    this.validateScheduleConflicts(courses)

    if (existing && existing.enrollmentCourses && existing.enrollmentCourses.length > 0 && existing.status === EnrollmentStatus.APPROVED) {
      const existingCourses = existing.enrollmentCourses.map((ec) => ec.course).filter(Boolean)
      if (existingCourses.length > 0) {
        const existingWithSchedules = await this.courseRepo.find({
          where: existingCourses.map((c) => ({ id: c.id })),
          relations: ['schedules'],
        })
        this.validateScheduleConflicts([...existingWithSchedules, ...courses])
      }
    }

    const enrollment = this.enrollmentRepo.create({
      student: { id: studentId },
      semester: { id: targetSemesterId },
      status: EnrollmentStatus.PENDING,
      totalCredits: totalCredits,
    })
    const savedEnrollment = await this.enrollmentRepo.save(enrollment)

    const enrollmentCourses = courses.map((course) =>
      this.enrollmentCourseRepo.create({
        enrollment: savedEnrollment,
        course,
      })
    )
    await this.enrollmentCourseRepo.save(enrollmentCourses)

    return this.getEnrollment(savedEnrollment.id)
  }

  async approve(enrollmentId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['enrollmentCourses', 'enrollmentCourses.course'],
    })
    if (!enrollment) throw new AppError('Enrollment not found', 404)
    if (enrollment.status !== 'PENDING') {
      throw new AppError(`Cannot approve — enrollment is already ${enrollment.status}`, 400)
    }

    for (const ec of enrollment.enrollmentCourses || []) {
      const course = ec.course
      if (course) {
        const enrolledCount = await this.enrollmentCourseRepo.count({
          where: { course: { id: course.id } },
        })
        if (course.capacity && enrolledCount >= course.capacity) {
          throw new AppError(`Course "${course.name}" is full (capacity: ${course.capacity})`, 409)
        }
      }
    }

    enrollment.status = EnrollmentStatus.APPROVED
    await this.enrollmentRepo.save(enrollment)
    return this.getEnrollment(enrollment.id)
  }

  async reject(enrollmentId: string, reason?: string): Promise<Enrollment> {
    const enrollment = await this.getEnrollment(enrollmentId)

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new AppError(`Cannot reject — enrollment is already ${enrollment.status}`, 400)
    }

    enrollment.status = EnrollmentStatus.REJECTED
    await this.enrollmentRepo.save(enrollment)
    return this.getEnrollment(enrollment.id)
  }

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
    await this.enrollmentRepo.save(enrollment)
    return this.getEnrollment(enrollment.id)
  }

  async bulkApprove(enrollmentIds: string[]): Promise<Enrollment[]> {
    const results: Enrollment[] = []
    for (const id of enrollmentIds) {
      results.push(await this.approve(id))
    }
    return results
  }

  async validateSelection(studentId: string, semesterId?: string, courseIds: string[] = []) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } })
    if (!student) throw new AppError('Student not found', 404)

    let targetSemesterId = semesterId;
    if (!targetSemesterId) {
      const activeSem = await this.semesterRepo.findOne({ where: { status: SemesterStatus.ACTIVE } });
      targetSemesterId = activeSem?.id;
    }

    const semester = targetSemesterId ? await this.semesterRepo.findOne({ where: { id: targetSemesterId } }) : null;

    if (!courseIds || courseIds.length === 0) {
      return {
        valid: true,
        totalCredits: 0,
        courseCount: 0,
        semester,
        student,
      }
    }

    const courses = await this.courseRepo.find({
      where: courseIds.map((id) => ({ id })),
      relations: ['schedules'],
    })

    if (courses.length !== courseIds.length) {
      throw new AppError('One or more courses not found', 404)
    }

    const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0)
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

  async getMyCourses(studentId: string, semesterId?: string): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({
      where: semesterId
        ? { student: { id: studentId }, semester: { id: semesterId } }
        : { student: { id: studentId } },
      relations: [
        'semester',
        'enrollmentCourses',
        'enrollmentCourses.course',
        'enrollmentCourses.course.department',
        'enrollmentCourses.course.teacher',
        'enrollmentCourses.course.teacher.user',
        'enrollmentCourses.course.schedules',
      ],
      order: { created_at: 'DESC' },
    })
  }

  private validateScheduleConflicts(courses: Course[]): void {
    const schedules: Array<{ schedule: Schedule; courseName: string }> = []

    for (const course of courses) {
      if (course.schedules && Array.isArray(course.schedules)) {
        for (const schedule of course.schedules) {
          schedules.push({ schedule, courseName: course.name })
        }
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
            `(${a.schedule.startTime}–${a.schedule.endTime} vs ` +
            `${b.schedule.startTime}–${b.schedule.endTime})`,
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

    const aStart = toMinutes(a.startTime)
    const aEnd = toMinutes(a.endTime)
    const bStart = toMinutes(b.startTime)
    const bEnd = toMinutes(b.endTime)

    return aStart < bEnd && bStart < aEnd
  }
}
