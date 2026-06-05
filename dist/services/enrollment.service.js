"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
// src/services/enrollment.service.ts
const database_1 = require("../config/database");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const enrollment_course_entity_1 = require("../entities/enrollment-course.entity");
const course_entity_1 = require("../entities/course.entity");
const semester_entity_1 = require("../entities/semester.entity");
const student_entity_1 = require("../entities/student.entity");
const app_error_1 = require("../core/errors/app-error");
const MAX_CREDITS = 18;
class EnrollmentService {
    constructor() {
        this.enrollmentRepo = database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment);
        this.enrollmentCourseRepo = database_1.AppDataSource.getRepository(enrollment_course_entity_1.EnrollmentCourse);
        this.courseRepo = database_1.AppDataSource.getRepository(course_entity_1.Course);
        this.semesterRepo = database_1.AppDataSource.getRepository(semester_entity_1.Semester);
        this.studentRepo = database_1.AppDataSource.getRepository(student_entity_1.Student);
    }
    async listEnrollments(filters = {}) {
        const query = this.enrollmentRepo.createQueryBuilder('enrollment')
            .leftJoinAndSelect('enrollment.student', 'student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('enrollment.semester', 'semester')
            .leftJoinAndSelect('enrollment.enrollmentCourses', 'enrollmentCourses')
            .leftJoinAndSelect('enrollmentCourses.course', 'course')
            .orderBy('enrollment.created_at', 'DESC');
        if (filters.studentId)
            query.andWhere('enrollment.studentId = :studentId', { studentId: filters.studentId });
        if (filters.semesterId)
            query.andWhere('enrollment.semesterId = :semesterId', { semesterId: filters.semesterId });
        if (filters.status)
            query.andWhere('enrollment.status = :status', { status: filters.status });
        return query.getMany();
    }
    async getEnrollment(enrollmentId) {
        const enrollment = await this.enrollmentRepo.findOne({
            where: { id: enrollmentId },
            relations: ['student', 'student.user', 'semester', 'enrollmentCourses', 'enrollmentCourses.course'],
        });
        if (!enrollment)
            throw new app_error_1.AppError('Enrollment not found', 404);
        return enrollment;
    }
    // ─── Enroll student in courses ───────────────────────────────────────────
    async enroll(studentId, semesterId, courseIds) {
        // 1. Validate student exists and is ACTIVE
        const student = await this.studentRepo.findOne({ where: { id: studentId } });
        if (!student)
            throw new app_error_1.AppError('Student not found', 404);
        if (student.status !== 'ACTIVE') {
            throw new app_error_1.AppError(`Cannot enroll — student status is ${student.status}`, 403);
        }
        // 2. Validate semester is ACTIVE
        const semester = await this.semesterRepo.findOne({ where: { id: semesterId } });
        if (!semester)
            throw new app_error_1.AppError('Semester not found', 404);
        if (semester.status !== 'ACTIVE') {
            throw new app_error_1.AppError(`Cannot enroll — semester is ${semester.status}`, 403);
        }
        // 3. Load requested courses with their schedules
        const courses = await this.courseRepo.find({
            where: courseIds.map((id) => ({ id })),
            relations: ['schedules'],
        });
        if (courses.length !== courseIds.length) {
            throw new app_error_1.AppError('One or more courses not found', 404);
        }
        // 4. Validate credit limit
        const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);
        if (totalCredits > MAX_CREDITS) {
            throw new app_error_1.AppError(`Total credits (${totalCredits}) exceeds the maximum allowed (${MAX_CREDITS})`, 400);
        }
        // 5. Check for duplicate enrollment in same semester
        const existing = await this.enrollmentRepo.findOne({
            where: { student: { id: studentId }, semester: { id: semesterId } },
            relations: ['enrollmentCourses', 'enrollmentCourses.course'],
        });
        if (existing) {
            const alreadyEnrolled = existing.enrollmentCourses.map((ec) => ec.course.id);
            const duplicate = courseIds.find((id) => alreadyEnrolled.includes(id));
            if (duplicate) {
                throw new app_error_1.AppError(`Already enrolled in course ID ${duplicate} this semester`, 409);
            }
        }
        // 6. Validate schedule conflicts (new courses vs each other)
        this.validateScheduleConflicts(courses);
        // 7. If student already has an enrollment this semester, also check
        //    new courses against already-enrolled course schedules
        if (existing) {
            const existingCourses = existing.enrollmentCourses.map((ec) => ec.course);
            const existingWithSchedules = await this.courseRepo.find({
                where: existingCourses.map((c) => ({ id: c.id })),
                relations: ['schedules'],
            });
            this.validateScheduleConflicts([...existingWithSchedules, ...courses]);
        }
        // 8. Create enrollment record
        const enrollment = this.enrollmentRepo.create({
            student: { id: studentId },
            semester: { id: semesterId },
            status: enrollment_entity_1.EnrollmentStatus.PENDING,
            total_credits: totalCredits,
        });
        const savedEnrollment = await this.enrollmentRepo.save(enrollment);
        // 9. Create enrollment_courses join records
        const enrollmentCourses = courses.map((course) => this.enrollmentCourseRepo.create({
            enrollment: savedEnrollment,
            course,
        }));
        await this.enrollmentCourseRepo.save(enrollmentCourses);
        return savedEnrollment;
    }
    // ─── Approve enrollment ───────────────────────────────────────────────────
    async approve(enrollmentId) {
        const enrollment = await this.enrollmentRepo.findOne({
            where: { id: enrollmentId },
            relations: ['enrollmentCourses', 'enrollmentCourses.course'],
        });
        if (!enrollment)
            throw new app_error_1.AppError('Enrollment not found', 404);
        if (enrollment.status !== 'PENDING') {
            throw new app_error_1.AppError(`Cannot approve — enrollment is already ${enrollment.status}`, 400);
        }
        // Check course capacities
        for (const ec of enrollment.enrollmentCourses) {
            const course = ec.course;
            const enrolledCount = await this.enrollmentCourseRepo.count({
                where: { course: { id: course.id } },
            });
            if (enrolledCount >= course.capacity) {
                throw new app_error_1.AppError(`Course "${course.name}" is full (capacity: ${course.capacity})`, 409);
            }
        }
        enrollment.status = enrollment_entity_1.EnrollmentStatus.APPROVED;
        return this.enrollmentRepo.save(enrollment);
    }
    async reject(enrollmentId, reason) {
        const enrollment = await this.getEnrollment(enrollmentId);
        if (enrollment.status !== enrollment_entity_1.EnrollmentStatus.PENDING) {
            throw new app_error_1.AppError(`Cannot reject — enrollment is already ${enrollment.status}`, 400);
        }
        enrollment.status = enrollment_entity_1.EnrollmentStatus.REJECTED;
        if (reason) {
            ;
            enrollment.rejectionReason = reason;
        }
        return this.enrollmentRepo.save(enrollment);
    }
    // ─── Cancel enrollment ────────────────────────────────────────────────────
    async cancel(enrollmentId, studentId) {
        const enrollment = await this.enrollmentRepo.findOne({
            where: studentId ? { id: enrollmentId, student: { id: studentId } } : { id: enrollmentId },
            relations: ['student'],
        });
        if (!enrollment)
            throw new app_error_1.AppError('Enrollment not found', 404);
        if (enrollment.status === enrollment_entity_1.EnrollmentStatus.CANCELLED) {
            throw new app_error_1.AppError('Enrollment is already cancelled', 400);
        }
        enrollment.status = enrollment_entity_1.EnrollmentStatus.CANCELLED;
        return this.enrollmentRepo.save(enrollment);
    }
    async bulkApprove(enrollmentIds) {
        const results = [];
        for (const id of enrollmentIds) {
            results.push(await this.approve(id));
        }
        return results;
    }
    async validateSelection(studentId, semesterId, courseIds) {
        const student = await this.studentRepo.findOne({ where: { id: studentId } });
        if (!student)
            throw new app_error_1.AppError('Student not found', 404);
        const semester = await this.semesterRepo.findOne({ where: { id: semesterId } });
        if (!semester)
            throw new app_error_1.AppError('Semester not found', 404);
        const courses = await this.courseRepo.find({
            where: courseIds.map((id) => ({ id })),
            relations: ['schedules'],
        });
        if (courses.length !== courseIds.length) {
            throw new app_error_1.AppError('One or more courses not found', 404);
        }
        const totalCredits = courses.reduce((sum, course) => sum + course.credit, 0);
        if (totalCredits > MAX_CREDITS) {
            throw new app_error_1.AppError(`Total credits (${totalCredits}) exceeds the maximum allowed (${MAX_CREDITS})`, 400);
        }
        this.validateScheduleConflicts(courses);
        return {
            valid: true,
            totalCredits,
            courseCount: courses.length,
            semester,
            student,
        };
    }
    async getEnrollmentCourses(enrollmentId) {
        const enrollment = await this.getEnrollment(enrollmentId);
        return enrollment.enrollmentCourses?.map((item) => item.course) ?? [];
    }
    // ─── Get student's enrolled courses ──────────────────────────────────────
    async getMyCourses(studentId, semesterId) {
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
        });
    }
    // ─── Schedule conflict validator ──────────────────────────────────────────
    validateScheduleConflicts(courses) {
        const schedules = [];
        for (const course of courses) {
            for (const schedule of course.schedules) {
                schedules.push({ schedule, courseName: course.name });
            }
        }
        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                const a = schedules[i];
                const b = schedules[j];
                if (a.schedule.day === b.schedule.day && this.timesOverlap(a.schedule, b.schedule)) {
                    throw new app_error_1.AppError(`Schedule conflict: "${a.courseName}" and "${b.courseName}" ` +
                        `overlap on ${a.schedule.day} ` +
                        `(${a.schedule.start_time}–${a.schedule.end_time} vs ` +
                        `${b.schedule.start_time}–${b.schedule.end_time})`, 409);
                }
            }
        }
    }
    timesOverlap(a, b) {
        const toMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const aStart = toMinutes(a.start_time);
        const aEnd = toMinutes(a.end_time);
        const bStart = toMinutes(b.start_time);
        const bEnd = toMinutes(b.end_time);
        // Overlap if one starts before the other ends
        return aStart < bEnd && bStart < aEnd;
    }
}
exports.EnrollmentService = EnrollmentService;
