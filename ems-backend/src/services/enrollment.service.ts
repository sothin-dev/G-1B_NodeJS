// src/services/enrollment.service.ts
import { AppDataSource } from '../config/database'
import { Enrollment } from '../models/Enrollment'
import { EnrollmentCourse } from '../models/EnrollmentCourse'
import { Course } from '../models/Course'
import { Schedule } from '../models/Schedule'
import { Semester } from '../models/Semester'
import { Student } from '../models/Student'
import { AppError } from '../middleware/error.middleware'

const MAX_CREDITS = 18

export class EnrollmentService {
  private enrollmentRepo = AppDataSource.getRepository(Enrollment)
  private enrollmentCourseRepo = AppDataSource.getRepository(EnrollmentCourse)
  private courseRepo = AppDataSource.getRepository(Course)
  private semesterRepo = AppDataSource.getRepository(Semester)
  private studentRepo = AppDataSource.getRepository(Student)

  // ─── Enroll student in courses ───────────────────────────────────────────

  async enroll(studentId: number, semesterId: number, courseIds: number[]): Promise<Enrollment> {

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
      status: 'PENDING',
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

  async approve(enrollmentId: number): Promise<Enrollment> {
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

    enrollment.status = 'APPROVED'
    return this.enrollmentRepo.save(enrollment)
  }

  // ─── Cancel enrollment ────────────────────────────────────────────────────

  async cancel(enrollmentId: number, studentId: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, student: { id: studentId } },
    })
    if (!enrollment) throw new AppError('Enrollment not found', 404)
    if (enrollment.status === 'APPROVED') {
      throw new AppError('Cannot cancel an already approved enrollment', 400)
    }

    enrollment.status = 'CANCELLED'
    return this.enrollmentRepo.save(enrollment)
  }

  // ─── Get student's enrolled courses ──────────────────────────────────────

  async getMyCourses(studentId: number, semesterId: number): Promise<Enrollment | null> {
    return this.enrollmentRepo.findOne({
      where: { student: { id: studentId }, semester: { id: semesterId } },
      relations: [
        'enrollmentCourses',
        'enrollmentCourses.course',
        'enrollmentCourses.course.schedules',
      ],
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