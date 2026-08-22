"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
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
            .leftJoinAndSelect('student.department', 'studentDept')
            .leftJoinAndSelect('enrollment.semester', 'semester')
            .leftJoinAndSelect('enrollment.enrollmentCourses', 'enrollmentCourses')
            .leftJoinAndSelect('enrollmentCourses.course', 'course')
            .leftJoinAndSelect('course.department', 'courseDept')
            .leftJoinAndSelect('course.teacher', 'teacher')
            .leftJoinAndSelect('teacher.user', 'teacherUser')
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
        });
        if (!enrollment)
            throw new app_error_1.AppError('Enrollment not found', 404);
        return enrollment;
    }
    async enroll(studentId, semesterId, courseIds = []) {
        const student = await this.studentRepo.findOne({ where: { id: studentId } });
        if (!student)
            throw new app_error_1.AppError('Student not found', 404);
        if (student.status !== 'ACTIVE') {
            throw new app_error_1.AppError(`Cannot enroll — student status is ${student.status}`, 403);
        }
        let targetSemesterId = semesterId;
        if (!targetSemesterId) {
            const activeSem = await this.semesterRepo.findOne({ where: { status: semester_entity_1.SemesterStatus.ACTIVE } });
            if (!activeSem) {
                throw new app_error_1.AppError('No active semester found for enrollment', 400);
            }
            targetSemesterId = activeSem.id;
        }
        const semester = await this.semesterRepo.findOne({ where: { id: targetSemesterId } });
        if (!semester)
            throw new app_error_1.AppError('Semester not found', 404);
        if (semester.status !== 'ACTIVE') {
            throw new app_error_1.AppError(`Cannot enroll — semester is ${semester.status}`, 403);
        }
        if (!courseIds || courseIds.length === 0) {
            throw new app_error_1.AppError('At least one course must be selected for enrollment', 400);
        }
        const courses = await this.courseRepo.find({
            where: courseIds.map((id) => ({ id })),
            relations: ['schedules'],
        });
        if (courses.length !== courseIds.length) {
            throw new app_error_1.AppError('One or more courses not found', 404);
        }
        const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
        if (totalCredits > MAX_CREDITS) {
            throw new app_error_1.AppError(`Total credits (${totalCredits}) exceeds the maximum allowed (${MAX_CREDITS})`, 400);
        }
        const existing = await this.enrollmentRepo.findOne({
            where: { student: { id: studentId }, semester: { id: targetSemesterId } },
            relations: ['enrollmentCourses', 'enrollmentCourses.course'],
        });
        if (existing && existing.status !== enrollment_entity_1.EnrollmentStatus.CANCELLED && existing.status !== enrollment_entity_1.EnrollmentStatus.REJECTED) {
            const alreadyEnrolled = (existing.enrollmentCourses || []).map((ec) => ec.course?.id).filter(Boolean);
            const duplicate = courseIds.find((id) => alreadyEnrolled.includes(id));
            if (duplicate) {
                throw new app_error_1.AppError(`Already enrolled in course ID ${duplicate} this semester`, 409);
            }
        }
        this.validateScheduleConflicts(courses);
        if (existing && existing.enrollmentCourses && existing.enrollmentCourses.length > 0 && existing.status === enrollment_entity_1.EnrollmentStatus.APPROVED) {
            const existingCourses = existing.enrollmentCourses.map((ec) => ec.course).filter(Boolean);
            if (existingCourses.length > 0) {
                const existingWithSchedules = await this.courseRepo.find({
                    where: existingCourses.map((c) => ({ id: c.id })),
                    relations: ['schedules'],
                });
                this.validateScheduleConflicts([...existingWithSchedules, ...courses]);
            }
        }
        const enrollment = this.enrollmentRepo.create({
            student: { id: studentId },
            semester: { id: targetSemesterId },
            status: enrollment_entity_1.EnrollmentStatus.PENDING,
            totalCredits: totalCredits,
        });
        const savedEnrollment = await this.enrollmentRepo.save(enrollment);
        const enrollmentCourses = courses.map((course) => this.enrollmentCourseRepo.create({
            enrollment: savedEnrollment,
            course,
        }));
        await this.enrollmentCourseRepo.save(enrollmentCourses);
        return this.getEnrollment(savedEnrollment.id);
    }
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
        for (const ec of enrollment.enrollmentCourses || []) {
            const course = ec.course;
            if (course) {
                const enrolledCount = await this.enrollmentCourseRepo.count({
                    where: { course: { id: course.id } },
                });
                if (course.capacity && enrolledCount >= course.capacity) {
                    throw new app_error_1.AppError(`Course "${course.name}" is full (capacity: ${course.capacity})`, 409);
                }
            }
        }
        enrollment.status = enrollment_entity_1.EnrollmentStatus.APPROVED;
        await this.enrollmentRepo.save(enrollment);
        return this.getEnrollment(enrollment.id);
    }
    async reject(enrollmentId, reason) {
        const enrollment = await this.getEnrollment(enrollmentId);
        if (enrollment.status !== enrollment_entity_1.EnrollmentStatus.PENDING) {
            throw new app_error_1.AppError(`Cannot reject — enrollment is already ${enrollment.status}`, 400);
        }
        enrollment.status = enrollment_entity_1.EnrollmentStatus.REJECTED;
        await this.enrollmentRepo.save(enrollment);
        return this.getEnrollment(enrollment.id);
    }
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
        await this.enrollmentRepo.save(enrollment);
        return this.getEnrollment(enrollment.id);
    }
    async bulkApprove(enrollmentIds) {
        const results = [];
        for (const id of enrollmentIds) {
            results.push(await this.approve(id));
        }
        return results;
    }
    async validateSelection(studentId, semesterId, courseIds = []) {
        const student = await this.studentRepo.findOne({ where: { id: studentId } });
        if (!student)
            throw new app_error_1.AppError('Student not found', 404);
        let targetSemesterId = semesterId;
        if (!targetSemesterId) {
            const activeSem = await this.semesterRepo.findOne({ where: { status: semester_entity_1.SemesterStatus.ACTIVE } });
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
            };
        }
        const courses = await this.courseRepo.find({
            where: courseIds.map((id) => ({ id })),
            relations: ['schedules'],
        });
        if (courses.length !== courseIds.length) {
            throw new app_error_1.AppError('One or more courses not found', 404);
        }
        const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
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
    async getMyCourses(studentId, semesterId) {
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
        });
    }
    validateScheduleConflicts(courses) {
        const schedules = [];
        for (const course of courses) {
            if (course.schedules && Array.isArray(course.schedules)) {
                for (const schedule of course.schedules) {
                    schedules.push({ schedule, courseName: course.name });
                }
            }
        }
        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                const a = schedules[i];
                const b = schedules[j];
                if (a.schedule.day === b.schedule.day && this.timesOverlap(a.schedule, b.schedule)) {
                    throw new app_error_1.AppError(`Schedule conflict: "${a.courseName}" and "${b.courseName}" ` +
                        `overlap on ${a.schedule.day} ` +
                        `(${a.schedule.startTime}–${a.schedule.endTime} vs ` +
                        `${b.schedule.startTime}–${b.schedule.endTime})`, 409);
                }
            }
        }
    }
    timesOverlap(a, b) {
        const toMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        const aStart = toMinutes(a.startTime);
        const aEnd = toMinutes(a.endTime);
        const bStart = toMinutes(b.startTime);
        const bEnd = toMinutes(b.endTime);
        return aStart < bEnd && bStart < aEnd;
    }
}
exports.EnrollmentService = EnrollmentService;
