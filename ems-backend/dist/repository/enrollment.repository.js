"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentRepository = void 0;
const typeorm_1 = require("typeorm");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const enrollment_course_entity_1 = require("../entities/enrollment-course.entity");
const database_1 = require("../config/database");
class EnrollmentRepository {
    constructor() {
        this.repo = database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment);
        this.enrollmentCourseRepo = database_1.AppDataSource.getRepository(enrollment_course_entity_1.EnrollmentCourse);
    }
    async create(data) {
        const enrollment = this.repo.create(data);
        return await this.repo.save(enrollment);
    }
    async createWithCourses(data, courseIds) {
        const enrollment = this.repo.create(data);
        const savedEnrollment = await this.repo.save(enrollment);
        const enrollmentCourses = courseIds.map(courseId => this.enrollmentCourseRepo.create({
            enrollment_id: savedEnrollment.id,
            course_id: courseId,
        }));
        await this.enrollmentCourseRepo.save(enrollmentCourses);
        const enrollmentWithRelations = await this.findById(savedEnrollment.id);
        if (!enrollmentWithRelations) {
            throw new Error('Enrollment creation failed');
        }
        return enrollmentWithRelations;
    }
    async findById(id) {
        return await this.repo.findOne({
            where: { id },
            relations: ['student', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
        });
    }
    async findByIdForStudent(id, studentId) {
        return await this.repo.findOne({
            where: { id, studentId },
            relations: ['student', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
        });
    }
    async findExisting(studentId, semesterId, courseId) {
        return await this.repo
            .createQueryBuilder('e')
            .innerJoin('e.enrollmentCourses', 'ec')
            .where('e.studentId = :studentId', { studentId })
            .andWhere('e.semesterId = :semesterId', { semesterId })
            .andWhere('ec.course_id = :courseId', { courseId })
            .andWhere('e.status NOT IN (:...statuses)', { statuses: [enrollment_entity_1.EnrollmentStatus.CANCELLED, enrollment_entity_1.EnrollmentStatus.REJECTED] })
            .getOne();
    }
    async getStudentCreditsForSemester(studentId, semesterId) {
        const result = await this.repo
            .createQueryBuilder('e')
            .select('SUM(e.total_credits)', 'total')
            .where('e.studentId = :studentId', { studentId })
            .andWhere('e.semesterId = :semesterId', { semesterId })
            .andWhere('e.status IN (:...statuses)', {
            statuses: [enrollment_entity_1.EnrollmentStatus.PENDING, enrollment_entity_1.EnrollmentStatus.APPROVED],
        })
            .getRawOne();
        return Number(result?.total) || 0;
    }
    async findStudentApprovedEnrollments(studentId, semesterId) {
        return await this.repo.find({
            where: { studentId, semesterId, status: enrollment_entity_1.EnrollmentStatus.APPROVED },
            relations: ['enrollmentCourses', 'enrollmentCourses.course'],
        });
    }
    async updateStatus(id, status) {
        await this.repo.update(id, { status });
    }
    async updateStatusWithHistory(id, status, _adminId, _reason) {
        await this.repo.update(id, { status });
    }
    async countApprovedForCourse(courseId) {
        return await this.repo
            .createQueryBuilder('e')
            .innerJoin('e.enrollmentCourses', 'ec')
            .where('ec.course_id = :courseId', { courseId })
            .andWhere('e.status = :status', { status: enrollment_entity_1.EnrollmentStatus.APPROVED })
            .getCount();
    }
    async findAll(filters) {
        const qb = this.repo
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.student', 'student')
            .leftJoinAndSelect('e.semester', 'semester')
            .leftJoinAndSelect('e.enrollmentCourses', 'ec')
            .leftJoinAndSelect('ec.course', 'course');
        if (filters.studentId)
            qb.andWhere('e.studentId = :studentId', { studentId: filters.studentId });
        if (filters.semesterId)
            qb.andWhere('e.semesterId = :semesterId', { semesterId: filters.semesterId });
        if (filters.status)
            qb.andWhere('e.status = :status', { status: filters.status });
        const total = await qb.getCount();
        const enrollments = await qb
            .orderBy('e.id', 'DESC')
            .skip((filters.page - 1) * filters.limit)
            .take(filters.limit)
            .getMany();
        return { enrollments, total };
    }
    async getHistoryWithFilters(studentId, filters) {
        const qb = this.repo
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.student', 'student')
            .leftJoinAndSelect('e.semester', 'semester')
            .leftJoinAndSelect('e.enrollmentCourses', 'ec')
            .leftJoinAndSelect('ec.course', 'course')
            .where('e.studentId = :studentId', { studentId });
        if (filters.semester_id)
            qb.andWhere('e.semesterId = :semesterId', { semesterId: filters.semester_id });
        if (filters.status)
            qb.andWhere('e.status = :status', { status: filters.status });
        const total = await qb.getCount();
        const enrollments = await qb
            .orderBy('e.id', 'DESC')
            .skip((filters.page - 1) * filters.limit)
            .take(filters.limit)
            .getMany();
        return { enrollments, total };
    }
    async findMyCourses(studentId, semesterId) {
        return await this.repo.find({
            where: {
                studentId,
                semesterId,
                status: (0, typeorm_1.In)([enrollment_entity_1.EnrollmentStatus.PENDING, enrollment_entity_1.EnrollmentStatus.APPROVED]),
            },
            relations: ['semester', 'enrollmentCourses', 'enrollmentCourses.course'],
            order: { id: 'DESC' },
        });
    }
    async findCoursesByEnrollmentId(enrollmentId) {
        const enrollment = await this.findById(enrollmentId);
        return enrollment?.enrollmentCourses ?? [];
    }
    async findByIds(ids) {
        return await this.repo.find({
            where: { id: (0, typeorm_1.In)(ids) },
            relations: ['student', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
        });
    }
    async bulkApprove(ids) {
        await this.repo.update(ids, { status: enrollment_entity_1.EnrollmentStatus.APPROVED });
    }
}
exports.EnrollmentRepository = EnrollmentRepository;
