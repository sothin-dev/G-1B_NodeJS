import { Repository, In } from 'typeorm'
import { Enrollment, EnrollmentStatus } from '../entities/enrollment.entity'
import { EnrollmentCourse } from '../entities/enrollment-course.entity'
import { AppDataSource } from '../config/database'

export class EnrollmentRepository {
  private repo: Repository<Enrollment>
  private enrollmentCourseRepo: Repository<EnrollmentCourse>

  constructor() {
    this.repo = AppDataSource.getRepository(Enrollment)
    this.enrollmentCourseRepo = AppDataSource.getRepository(EnrollmentCourse)
  }

  async create(data: Partial<Enrollment>): Promise<Enrollment> {
    const enrollment = this.repo.create(data)
    return await this.repo.save(enrollment)
  }

  async createWithCourses(data: Partial<Enrollment>, courseIds: number[]): Promise<Enrollment> {
    const enrollment = this.repo.create(data)
    const savedEnrollment = await this.repo.save(enrollment)

    const enrollmentCourses = courseIds.map(courseId =>
      this.enrollmentCourseRepo.create({
        enrollment_id: savedEnrollment.id,
        course_id: courseId,
      })
    )

    await this.enrollmentCourseRepo.save(enrollmentCourses)
    const enrollmentWithRelations = await this.findById(savedEnrollment.id)
    if (!enrollmentWithRelations) {
      throw new Error('Enrollment creation failed')
    }
    return enrollmentWithRelations
  }

  async findById(id: number): Promise<Enrollment | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['student', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
    })
  }

  async findByIdForStudent(id: number, studentId: number): Promise<Enrollment | null> {
    return await this.repo.findOne({
      where: { id, studentId },
      relations: ['student', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
    })
  }

  async findExisting(studentId: number, semesterId: number, courseId: number): Promise<Enrollment | null> {
    return await this.repo
      .createQueryBuilder('e')
      .innerJoin('e.enrollmentCourses', 'ec')
      .where('e.studentId = :studentId', { studentId })
      .andWhere('e.semesterId = :semesterId', { semesterId })
      .andWhere('ec.course_id = :courseId', { courseId })
      .andWhere('e.status NOT IN (:...statuses)', { statuses: [EnrollmentStatus.CANCELLED, EnrollmentStatus.REJECTED] })
      .getOne()
  }

  async getStudentCreditsForSemester(studentId: number, semesterId: number): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('e')
      .select('SUM(e.total_credits)', 'total')
      .where('e.studentId = :studentId', { studentId })
      .andWhere('e.semesterId = :semesterId', { semesterId })
      .andWhere('e.status IN (:...statuses)', {
        statuses: [EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED],
      })
      .getRawOne()
    return Number(result?.total) || 0
  }

  async findStudentApprovedEnrollments(studentId: number, semesterId: number): Promise<Enrollment[]> {
    return await this.repo.find({
      where: { studentId, semesterId, status: EnrollmentStatus.APPROVED },
      relations: ['enrollmentCourses', 'enrollmentCourses.course'],
    })
  }

  async updateStatus(id: number, status: EnrollmentStatus): Promise<void> {
    await this.repo.update(id, { status })
  }

  async updateStatusWithHistory(
    id: number,
    status: EnrollmentStatus,
    _adminId: number,
    _reason?: string
  ): Promise<void> {
    await this.repo.update(id, { status })
  }

  async countApprovedForCourse(courseId: number): Promise<number> {
    return await this.repo
      .createQueryBuilder('e')
      .innerJoin('e.enrollmentCourses', 'ec')
      .where('ec.course_id = :courseId', { courseId })
      .andWhere('e.status = :status', { status: EnrollmentStatus.APPROVED })
      .getCount()
  }

  async findAll(filters: {
    studentId?: number
    semesterId?: number
    status?: string
    page: number
    limit: number
  }): Promise<{ enrollments: Enrollment[]; total: number }> {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 'student')
      .leftJoinAndSelect('e.semester', 'semester')
      .leftJoinAndSelect('e.enrollmentCourses', 'ec')
      .leftJoinAndSelect('ec.course', 'course')

    if (filters.studentId) qb.andWhere('e.studentId = :studentId', { studentId: filters.studentId })
    if (filters.semesterId) qb.andWhere('e.semesterId = :semesterId', { semesterId: filters.semesterId })
    if (filters.status) qb.andWhere('e.status = :status', { status: filters.status })

    const total = await qb.getCount()
    const enrollments = await qb
      .orderBy('e.id', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany()

    return { enrollments, total }
  }

  async getHistoryWithFilters(
    studentId: number,
    filters: {
      semester_id?: number
      status?: string
      page: number
      limit: number
    }
  ): Promise<{ enrollments: Enrollment[]; total: number }> {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 'student')
      .leftJoinAndSelect('e.semester', 'semester')
      .leftJoinAndSelect('e.enrollmentCourses', 'ec')
      .leftJoinAndSelect('ec.course', 'course')
      .where('e.studentId = :studentId', { studentId })

    if (filters.semester_id) qb.andWhere('e.semesterId = :semesterId', { semesterId: filters.semester_id })
    if (filters.status) qb.andWhere('e.status = :status', { status: filters.status })

    const total = await qb.getCount()
    const enrollments = await qb
      .orderBy('e.id', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getMany()

    return { enrollments, total }
  }

  async findMyCourses(studentId: number, semesterId: number): Promise<Enrollment[]> {
    return await this.repo.find({
      where: {
        studentId,
        semesterId,
        status: In([EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED]),
      },
      relations: ['semester', 'enrollmentCourses', 'enrollmentCourses.course'],
      order: { id: 'DESC' },
    })
  }

  async findCoursesByEnrollmentId(enrollmentId: number) {
    const enrollment = await this.findById(enrollmentId)
    return enrollment?.enrollmentCourses ?? []
  }

  async findByIds(ids: number[]): Promise<Enrollment[]> {
    return await this.repo.find({
      where: { id: In(ids) },
      relations: ['student', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
    })
  }

  async bulkApprove(ids: number[]): Promise<void> {
    await this.repo.update(ids, { status: EnrollmentStatus.APPROVED })
  }
}
