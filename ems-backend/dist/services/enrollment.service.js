"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const enrollment_repository_1 = require("../repository/enrollment.repository");
const course_repository_1 = require("../repository/course.repository");
const semester_repository_1 = require("../repository/semester.repository");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const semester_entity_1 = require("../entities/semester.entity");
class EnrollmentService {
    constructor() {
        this.MAX_CREDITS = 18;
        this.enrollmentRepo = new enrollment_repository_1.EnrollmentRepository();
        this.courseRepo = new course_repository_1.CourseRepository();
        this.semesterRepo = new semester_repository_1.SemesterRepository();
    }
    async enrollInCourses(studentId, semesterId, courseIds) {
        const semester = await this.semesterRepo.findById(semesterId);
        if (!semester)
            throw new Error('Semester not found');
        if (semester.status !== semester_entity_1.SemesterStatus.ACTIVE)
            throw new Error('Enrollment is only allowed during active semesters');
        const uniqueCourseIds = [...new Set(courseIds)];
        if (uniqueCourseIds.length !== courseIds.length)
            throw new Error('Duplicate courses detected in request');
        const courses = await this.courseRepo.findByIds(uniqueCourseIds);
        if (courses.length !== uniqueCourseIds.length)
            throw new Error('One or more courses not found');
        for (const course of courses) {
            const existing = await this.enrollmentRepo.findExisting(studentId, semesterId, course.id);
            if (existing)
                throw new Error(`Already enrolled in course: ${course.name}`);
        }
        const requestedCredits = courses.reduce((sum, c) => sum + c.credit, 0);
        const currentCredits = await this.enrollmentRepo.getStudentCreditsForSemester(studentId, semesterId);
        if (currentCredits + requestedCredits > this.MAX_CREDITS) {
            throw new Error(`Credit limit exceeded. Maximum ${this.MAX_CREDITS} credits. ` +
                `You have ${currentCredits} credits, trying to add ${requestedCredits} credits.`);
        }
        await this.checkScheduleConflicts(studentId, semesterId, courses);
        return await this.enrollmentRepo.createWithCourses({
            studentId,
            semesterId,
            status: enrollment_entity_1.EnrollmentStatus.PENDING,
            total_credits: requestedCredits,
        }, uniqueCourseIds);
    }
    async cancelEnrollment(enrollmentId, userId, role) {
        const enrollment = await this.enrollmentRepo.findById(enrollmentId);
        if (!enrollment)
            throw new Error('Enrollment not found');
        const normalizedRole = String(role).toUpperCase();
        if (normalizedRole === 'STUDENT' || normalizedRole === 'ST') {
            if (enrollment.studentId !== userId)
                throw new Error('You can only cancel your own enrollments');
            if (enrollment.status === enrollment_entity_1.EnrollmentStatus.REJECTED)
                throw new Error('Cannot cancel a rejected enrollment');
        }
        if (enrollment.status === enrollment_entity_1.EnrollmentStatus.CANCELLED)
            throw new Error('Enrollment is already cancelled');
        await this.enrollmentRepo.updateStatus(enrollmentId, enrollment_entity_1.EnrollmentStatus.CANCELLED);
    }
    async approveEnrollment(enrollmentId, adminId) {
        const enrollment = await this.enrollmentRepo.findById(enrollmentId);
        if (!enrollment)
            throw new Error('Enrollment not found');
        if (enrollment.status !== enrollment_entity_1.EnrollmentStatus.PENDING) {
            throw new Error(`Cannot approve enrollment with status: ${enrollment.status}`);
        }
        const capacityViolations = await this.checkEnrollmentCapacity(enrollment);
        if (capacityViolations.length > 0) {
            throw new Error(capacityViolations.join('; '));
        }
        await this.enrollmentRepo.updateStatusWithHistory(enrollmentId, enrollment_entity_1.EnrollmentStatus.APPROVED, adminId);
        return (await this.enrollmentRepo.findById(enrollmentId));
    }
    async rejectEnrollment(enrollmentId, adminId, reason) {
        const enrollment = await this.enrollmentRepo.findById(enrollmentId);
        if (!enrollment)
            throw new Error('Enrollment not found');
        if (enrollment.status !== enrollment_entity_1.EnrollmentStatus.PENDING) {
            throw new Error(`Cannot reject enrollment with status: ${enrollment.status}`);
        }
        await this.enrollmentRepo.updateStatusWithHistory(enrollmentId, enrollment_entity_1.EnrollmentStatus.REJECTED, adminId, reason);
        return (await this.enrollmentRepo.findById(enrollmentId));
    }
    async listEnrollments(filters) {
        return await this.enrollmentRepo.findAll(filters);
    }
    async getEnrollmentById(id, userId, role) {
        const enrollment = await this.enrollmentRepo.findById(id);
        if (!enrollment)
            throw new Error('Enrollment not found');
        const normalizedRole = String(role).toUpperCase();
        if (normalizedRole === 'STUDENT' || normalizedRole === 'ST') {
            if (enrollment.studentId !== userId)
                throw new Error('You can only view your own enrollment');
        }
        return enrollment;
    }
    async getMyCourses(studentId, semesterId) {
        let semester = undefined;
        if (semesterId) {
            semester = await this.semesterRepo.findById(semesterId);
            if (!semester)
                throw new Error('Semester not found');
        }
        else {
            semester = await this.semesterRepo.findActive();
            if (!semester)
                throw new Error('No active semester found');
        }
        return await this.enrollmentRepo.findMyCourses(studentId, semester.id);
    }
    async validateEnrollment(studentId, semesterId, courseIds) {
        const semester = await this.semesterRepo.findById(semesterId);
        if (!semester)
            throw new Error('Semester not found');
        const uniqueCourseIds = [...new Set(courseIds)];
        const errors = [];
        if (semester.status !== semester_entity_1.SemesterStatus.ACTIVE) {
            errors.push('Enrollment is only allowed during active semesters');
        }
        if (uniqueCourseIds.length !== courseIds.length) {
            errors.push('Duplicate courses detected in request');
        }
        const courses = await this.courseRepo.findByIds(uniqueCourseIds);
        if (courses.length !== uniqueCourseIds.length) {
            errors.push('One or more courses not found');
        }
        for (const course of courses) {
            const existing = await this.enrollmentRepo.findExisting(studentId, semesterId, course.id);
            if (existing)
                errors.push(`Already enrolled in course: ${course.name}`);
        }
        const requestedCredits = courses.reduce((sum, c) => sum + c.credit, 0);
        const currentCredits = await this.enrollmentRepo.getStudentCreditsForSemester(studentId, semesterId);
        const totalCredits = currentCredits + requestedCredits;
        if (totalCredits > this.MAX_CREDITS) {
            errors.push(`Credit limit exceeded. Maximum ${this.MAX_CREDITS} credits. You have ${currentCredits} credits, trying to add ${requestedCredits} credits.`);
        }
        const conflicts = await this.getScheduleConflictMessages(studentId, semesterId, courses);
        if (conflicts.length) {
            errors.push(...conflicts);
        }
        return {
            valid: errors.length === 0,
            requested_credits: requestedCredits,
            current_credits: currentCredits,
            total_credits: totalCredits,
            errors,
        };
    }
    async getEnrollmentCourses(enrollmentId) {
        const enrollment = await this.enrollmentRepo.findById(enrollmentId);
        if (!enrollment)
            throw new Error('Enrollment not found');
        return enrollment.enrollmentCourses?.map(ec => ec.course) ?? [];
    }
    async bulkApproveEnrollments(enrollmentIds, adminId) {
        if (!enrollmentIds || enrollmentIds.length === 0) {
            throw new Error('enrollment_ids must be a non-empty array');
        }
        const enrollments = await this.enrollmentRepo.findByIds(enrollmentIds);
        if (enrollments.length !== enrollmentIds.length) {
            throw new Error('One or more enrollment records were not found');
        }
        for (const enrollment of enrollments) {
            if (enrollment.status !== enrollment_entity_1.EnrollmentStatus.PENDING) {
                throw new Error(`Cannot approve enrollment with status: ${enrollment.status}`);
            }
            const capacityViolations = await this.checkEnrollmentCapacity(enrollment);
            if (capacityViolations.length > 0) {
                throw new Error(capacityViolations.join('; '));
            }
        }
        await this.enrollmentRepo.bulkApprove(enrollmentIds);
        return await this.enrollmentRepo.findByIds(enrollmentIds);
    }
    async getEnrollmentHistory(studentId, filters) {
        return await this.enrollmentRepo.getHistoryWithFilters(studentId, filters);
    }
    async getScheduleConflictMessages(studentId, semesterId, newCourses) {
        const existingEnrollments = await this.enrollmentRepo.findStudentApprovedEnrollments(studentId, semesterId);
        const existingCourseIds = existingEnrollments.flatMap(e => e.enrollmentCourses?.map(ec => ec.course_id) ?? []);
        const existingCourses = existingCourseIds.length ? await this.courseRepo.findByIds(existingCourseIds) : [];
        const allCourseIds = [...existingCourses, ...newCourses].map(c => c.id);
        const schedules = await this.courseRepo.getSchedulesForCourses(allCourseIds);
        const conflicts = [];
        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                const s1 = schedules[i];
                const s2 = schedules[j];
                if (s1.day === s2.day && this.isTimeOverlap(s1.start_time, s1.end_time, s2.start_time, s2.end_time)) {
                    conflicts.push(`Schedule conflict: ${s1.course_name} (${s1.start_time}-${s1.end_time}) overlaps with ${s2.course_name} (${s2.start_time}-${s2.end_time}) on ${s1.day}`);
                }
            }
        }
        return conflicts;
    }
    async checkScheduleConflicts(studentId, semesterId, newCourses) {
        const conflicts = await this.getScheduleConflictMessages(studentId, semesterId, newCourses);
        if (conflicts.length > 0) {
            throw new Error(conflicts.join('; '));
        }
    }
    async checkEnrollmentCapacity(enrollment) {
        const errors = [];
        for (const ec of enrollment.enrollmentCourses ?? []) {
            const course = ec.course;
            if (!course)
                continue;
            const count = await this.enrollmentRepo.countApprovedForCourse(course.id);
            if (count >= course.capacity) {
                errors.push(`Course ${course.name} has reached capacity (${course.capacity})`);
            }
        }
        return errors;
    }
    isTimeOverlap(start1, end1, start2, end2) {
        const toMinutes = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };
        return toMinutes(start1) < toMinutes(end2) && toMinutes(end1) > toMinutes(start2);
    }
}
exports.EnrollmentService = EnrollmentService;
