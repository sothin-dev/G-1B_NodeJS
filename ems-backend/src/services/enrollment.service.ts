import { EnrollmentRepository } from '../repository/enrollment.repository'
import { CourseRepository } from '../repository/course.repository'
import { SemesterRepository } from '../repository/semester.repository'
import { Enrollment, EnrollmentStatus } from '../entities/enrollment.entity'
import { Course } from '../entities/course.entity'
import { SemesterStatus } from '../entities/semester.entity'

type EnrollmentFilters = {
  student_id?: number
  semester_id?: number
  status?: string
  page: number
  limit: number
}

type ValidateResult = {
  valid: boolean
  requested_credits: number
  current_credits: number
  total_credits: number
  errors: string[]
}

export class EnrollmentService {
  private enrollmentRepo: EnrollmentRepository
  private courseRepo: CourseRepository
  private semesterRepo: SemesterRepository
  private MAX_CREDITS = 18

  constructor() {
    this.enrollmentRepo = new EnrollmentRepository()
    this.courseRepo = new CourseRepository()
    this.semesterRepo = new SemesterRepository()
  }

  async enrollInCourses(studentId: number, semesterId: number, courseIds: number[]): Promise<Enrollment> {
    const semester = await this.semesterRepo.findById(semesterId)
    if (!semester) throw new Error('Semester not found')
    if (semester.status !== SemesterStatus.ACTIVE) throw new Error('Enrollment is only allowed during active semesters')

    const uniqueCourseIds = [...new Set(courseIds)]
    if (uniqueCourseIds.length !== courseIds.length) throw new Error('Duplicate courses detected in request')

    const courses = await this.courseRepo.findByIds(uniqueCourseIds)
    if (courses.length !== uniqueCourseIds.length) throw new Error('One or more courses not found')

    for (const course of courses) {
      const existing = await this.enrollmentRepo.findExisting(studentId, semesterId, course.id)
      if (existing) throw new Error(`Already enrolled in course: ${course.name}`)
    }

    const requestedCredits = courses.reduce((sum: number, c: Course) => sum + c.credit, 0)
    const currentCredits = await this.enrollmentRepo.getStudentCreditsForSemester(studentId, semesterId)

    if (currentCredits + requestedCredits > this.MAX_CREDITS) {
      throw new Error(
        `Credit limit exceeded. Maximum ${this.MAX_CREDITS} credits. ` +
        `You have ${currentCredits} credits, trying to add ${requestedCredits} credits.`
      )
    }

    await this.checkScheduleConflicts(studentId, semesterId, courses)

    return await this.enrollmentRepo.createWithCourses(
      {
        studentId,
        semesterId,
        status: EnrollmentStatus.PENDING,
        total_credits: requestedCredits,
      },
      uniqueCourseIds
    )
  }

  async cancelEnrollment(enrollmentId: number, userId: number, role: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId)
    if (!enrollment) throw new Error('Enrollment not found')

    const normalizedRole = String(role).toUpperCase()
    if (normalizedRole === 'STUDENT' || normalizedRole === 'ST') {
      if (enrollment.studentId !== userId) throw new Error('You can only cancel your own enrollments')
      if (enrollment.status === EnrollmentStatus.REJECTED) throw new Error('Cannot cancel a rejected enrollment')
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) throw new Error('Enrollment is already cancelled')
    await this.enrollmentRepo.updateStatus(enrollmentId, EnrollmentStatus.CANCELLED)
  }

  async approveEnrollment(enrollmentId: number, adminId: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId)
    if (!enrollment) throw new Error('Enrollment not found')
    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new Error(`Cannot approve enrollment with status: ${enrollment.status}`)
    }

    const capacityViolations = await this.checkEnrollmentCapacity(enrollment)
    if (capacityViolations.length > 0) {
      throw new Error(capacityViolations.join('; '))
    }

    await this.enrollmentRepo.updateStatusWithHistory(enrollmentId, EnrollmentStatus.APPROVED, adminId)
    return (await this.enrollmentRepo.findById(enrollmentId))!
  }

  async rejectEnrollment(enrollmentId: number, adminId: number, reason: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId)
    if (!enrollment) throw new Error('Enrollment not found')
    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new Error(`Cannot reject enrollment with status: ${enrollment.status}`)
    }

    await this.enrollmentRepo.updateStatusWithHistory(enrollmentId, EnrollmentStatus.REJECTED, adminId, reason)
    return (await this.enrollmentRepo.findById(enrollmentId))!
  }

  async listEnrollments(filters: EnrollmentFilters): Promise<{ enrollments: Enrollment[]; total: number }> {
    return await this.enrollmentRepo.findAll(filters)
  }

  async getEnrollmentById(id: number, userId: number, role: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findById(id)
    if (!enrollment) throw new Error('Enrollment not found')

    const normalizedRole = String(role).toUpperCase()
    if (normalizedRole === 'STUDENT' || normalizedRole === 'ST') {
      if (enrollment.studentId !== userId) throw new Error('You can only view your own enrollment')
    }

    return enrollment
  }

  async getMyCourses(studentId: number, semesterId?: number): Promise<Enrollment[]> {
    let semester = undefined
    if (semesterId) {
      semester = await this.semesterRepo.findById(semesterId)
      if (!semester) throw new Error('Semester not found')
    } else {
      semester = await this.semesterRepo.findActive()
      if (!semester) throw new Error('No active semester found')
    }

    return await this.enrollmentRepo.findMyCourses(studentId, semester.id)
  }

  async validateEnrollment(studentId: number, semesterId: number, courseIds: number[]): Promise<ValidateResult> {
    const semester = await this.semesterRepo.findById(semesterId)
    if (!semester) throw new Error('Semester not found')

    const uniqueCourseIds = [...new Set(courseIds)]
    const errors: string[] = []

    if (semester.status !== SemesterStatus.ACTIVE) {
      errors.push('Enrollment is only allowed during active semesters')
    }

    if (uniqueCourseIds.length !== courseIds.length) {
      errors.push('Duplicate courses detected in request')
    }

    const courses = await this.courseRepo.findByIds(uniqueCourseIds)
    if (courses.length !== uniqueCourseIds.length) {
      errors.push('One or more courses not found')
    }

    for (const course of courses) {
      const existing = await this.enrollmentRepo.findExisting(studentId, semesterId, course.id)
      if (existing) errors.push(`Already enrolled in course: ${course.name}`)
    }

    const requestedCredits = courses.reduce((sum: number, c: Course) => sum + c.credit, 0)
    const currentCredits = await this.enrollmentRepo.getStudentCreditsForSemester(studentId, semesterId)
    const totalCredits = currentCredits + requestedCredits

    if (totalCredits > this.MAX_CREDITS) {
      errors.push(
        `Credit limit exceeded. Maximum ${this.MAX_CREDITS} credits. You have ${currentCredits} credits, trying to add ${requestedCredits} credits.`
      )
    }

    const conflicts = await this.getScheduleConflictMessages(studentId, semesterId, courses)
    if (conflicts.length) {
      errors.push(...conflicts)
    }

    return {
      valid: errors.length === 0,
      requested_credits: requestedCredits,
      current_credits: currentCredits,
      total_credits: totalCredits,
      errors,
    }
  }

  async getEnrollmentCourses(enrollmentId: number) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId)
    if (!enrollment) throw new Error('Enrollment not found')
    return enrollment.enrollmentCourses?.map(ec => ec.course) ?? []
  }

  async bulkApproveEnrollments(enrollmentIds: number[], adminId: number): Promise<Enrollment[]> {
    if (!enrollmentIds || enrollmentIds.length === 0) {
      throw new Error('enrollment_ids must be a non-empty array')
    }

    const enrollments = await this.enrollmentRepo.findByIds(enrollmentIds)
    if (enrollments.length !== enrollmentIds.length) {
      throw new Error('One or more enrollment records were not found')
    }

    for (const enrollment of enrollments) {
      if (enrollment.status !== EnrollmentStatus.PENDING) {
        throw new Error(`Cannot approve enrollment with status: ${enrollment.status}`)
      }
      const capacityViolations = await this.checkEnrollmentCapacity(enrollment)
      if (capacityViolations.length > 0) {
        throw new Error(capacityViolations.join('; '))
      }
    }

    await this.enrollmentRepo.bulkApprove(enrollmentIds)
    return await this.enrollmentRepo.findByIds(enrollmentIds)
  }

  async getEnrollmentHistory(
    studentId: number,
    filters: { semester_id?: number; status?: string; page: number; limit: number }
  ): Promise<{ enrollments: Enrollment[]; total: number }> {
    return await this.enrollmentRepo.getHistoryWithFilters(studentId, filters)
  }

  private async getScheduleConflictMessages(studentId: number, semesterId: number, newCourses: Course[]): Promise<string[]> {
    const existingEnrollments = await this.enrollmentRepo.findStudentApprovedEnrollments(studentId, semesterId)
    const existingCourseIds = existingEnrollments.flatMap(e =>
      e.enrollmentCourses?.map(ec => ec.course_id) ?? []
    )
    const existingCourses = existingCourseIds.length ? await this.courseRepo.findByIds(existingCourseIds) : []

    const allCourseIds = [...existingCourses, ...newCourses].map(c => c.id)
    const schedules = await this.courseRepo.getSchedulesForCourses(allCourseIds)
    const conflicts: string[] = []

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i]
        const s2 = schedules[j]
        if (s1.day === s2.day && this.isTimeOverlap(s1.start_time, s1.end_time, s2.start_time, s2.end_time)) {
          conflicts.push(
            `Schedule conflict: ${s1.course_name} (${s1.start_time}-${s1.end_time}) overlaps with ${s2.course_name} (${s2.start_time}-${s2.end_time}) on ${s1.day}`
          )
        }
      }
    }

    return conflicts
  }

  private async checkScheduleConflicts(studentId: number, semesterId: number, newCourses: Course[]): Promise<void> {
    const conflicts = await this.getScheduleConflictMessages(studentId, semesterId, newCourses)
    if (conflicts.length > 0) {
      throw new Error(conflicts.join('; '))
    }
  }

  private async checkEnrollmentCapacity(enrollment: Enrollment): Promise<string[]> {
    const errors: string[] = []
    for (const ec of enrollment.enrollmentCourses ?? []) {
      const course = ec.course
      if (!course) continue
      const count = await this.enrollmentRepo.countApprovedForCourse(course.id)
      if (count >= course.capacity) {
        errors.push(`Course ${course.name} has reached capacity (${course.capacity})`)
      }
    }
    return errors
  }

  private isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }
    return toMinutes(start1) < toMinutes(end2) && toMinutes(end1) > toMinutes(start2)
  }
}
