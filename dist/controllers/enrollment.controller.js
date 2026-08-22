"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enroll = void 0;
const enrollment_service_1 = require("../services/enrollment.service");
const api_response_1 = require("../utils/api-response");
const student_repository_1 = __importDefault(require("../repository/student.repository"));
const activity_log_service_1 = __importDefault(require("../services/activity-log.service"));
const app_error_1 = require("../core/errors/app-error");
const enrollmentService = new enrollment_service_1.EnrollmentService();
class EnrollmentController {
    async resolveStudentId(req) {
        if (req.user?.role === 'STUDENT' && req.user?.id) {
            const student = await student_repository_1.default.findByUserId(req.user.id);
            return student ? student.id : null;
        }
        return (req.body?.studentId || req.query?.studentId) || null;
    }
    async listEnrollments(req, res, next) {
        try {
            let studentId = req.query.studentId;
            if (req.user?.role === 'STUDENT' && req.user?.id) {
                studentId = await this.resolveStudentId(req) || undefined;
            }
            const result = await enrollmentService.listEnrollments({
                studentId,
                semesterId: req.query.semesterId,
                status: req.query.status,
            });
            return (0, api_response_1.successResponse)(res, "List of enrollments", result);
        }
        catch (error) {
            next(error);
        }
    }
    async createEnrollment(req, res, next) {
        try {
            const studentId = await this.resolveStudentId(req);
            if (!studentId) {
                return (0, api_response_1.errorResponse)(res, "Student profile not found for this account", 400);
            }
            const semesterId = req.body.semesterId;
            const courseIds = Array.isArray(req.body.courseIds)
                ? req.body.courseIds
                : req.body.courseId
                    ? [req.body.courseId]
                    : [];
            const result = await enrollmentService.enroll(studentId, semesterId, courseIds);
            await activity_log_service_1.default.logActivity(req.user?.id, "ENROLLMENT_SUBMITTED", {
                enrollmentId: result.id,
                courseIds,
            });
            return (0, api_response_1.successResponse)(res, "Enrolled successfully", result, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getEnrollment(req, res, next) {
        try {
            const result = await enrollmentService.getEnrollment(req.params.id);
            if (req.user?.role === 'STUDENT') {
                const studentId = await this.resolveStudentId(req);
                if (!studentId) {
                    throw new app_error_1.AppError("Student profile not found for this account", 404);
                }
                if (result.studentId !== studentId) {
                    throw new app_error_1.AppError("Forbidden", 403);
                }
            }
            return (0, api_response_1.successResponse)(res, "Enrollment details", result);
        }
        catch (error) {
            next(error);
        }
    }
    async approveEnrollment(req, res, next) {
        try {
            const result = await enrollmentService.approve(req.params.id);
            await activity_log_service_1.default.logActivity(req.user?.id, "ENROLLMENT_APPROVED", {
                enrollmentId: req.params.id,
            });
            return (0, api_response_1.successResponse)(res, "Enrollment approved", result);
        }
        catch (error) {
            next(error);
        }
    }
    async rejectEnrollment(req, res, next) {
        try {
            const result = await enrollmentService.reject(req.params.id, req.body?.reason);
            await activity_log_service_1.default.logActivity(req.user?.id, "ENROLLMENT_REJECTED", {
                enrollmentId: req.params.id,
                reason: req.body?.reason,
            });
            return (0, api_response_1.successResponse)(res, "Enrollment rejected", result);
        }
        catch (error) {
            next(error);
        }
    }
    async cancelEnrollment(req, res, next) {
        try {
            let studentId = undefined;
            if (req.user?.role === 'STUDENT') {
                const resolved = await this.resolveStudentId(req);
                if (!resolved)
                    return (0, api_response_1.errorResponse)(res, "Student not found", 404);
                studentId = resolved;
            }
            const result = await enrollmentService.cancel(req.params.id, studentId);
            await activity_log_service_1.default.logActivity(req.user?.id, "ENROLLMENT_CANCELLED", {
                enrollmentId: req.params.id,
            });
            return (0, api_response_1.successResponse)(res, "Enrollment cancelled", result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyCourses(req, res, next) {
        try {
            if (!req.user?.id) {
                return (0, api_response_1.errorResponse)(res, "Unauthorized", 401);
            }
            const student = await student_repository_1.default.findByUserId(req.user.id);
            if (!student) {
                return (0, api_response_1.successResponse)(res, "No student profile found", []);
            }
            const result = await enrollmentService.getMyCourses(student.id, req.query.semesterId);
            return (0, api_response_1.successResponse)(res, "Student enrolled courses", result);
        }
        catch (error) {
            next(error);
        }
    }
    async validateSelection(req, res, next) {
        try {
            const studentId = await this.resolveStudentId(req);
            if (!studentId) {
                return (0, api_response_1.errorResponse)(res, "Student profile required", 400);
            }
            const semesterId = req.body.semesterId;
            const courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];
            const result = await enrollmentService.validateSelection(studentId, semesterId, courseIds);
            return (0, api_response_1.successResponse)(res, "Course selection is valid", result);
        }
        catch (error) {
            next(error);
        }
    }
    async getEnrollmentCourses(req, res, next) {
        try {
            const result = await enrollmentService.getEnrollmentCourses(req.params.id);
            return (0, api_response_1.successResponse)(res, "Enrollment courses", result);
        }
        catch (error) {
            next(error);
        }
    }
    async bulkApprove(req, res, next) {
        try {
            const result = await enrollmentService.bulkApprove(req.body.enrollmentIds ?? []);
            await activity_log_service_1.default.logActivity(req.user?.id, "ENROLLMENTS_BULK_APPROVED", {
                count: (req.body.enrollmentIds ?? []).length,
            });
            return (0, api_response_1.successResponse)(res, "Enrollments approved", result);
        }
        catch (error) {
            next(error);
        }
    }
}
const enrollmentController = new EnrollmentController();
exports.enroll = enrollmentController.createEnrollment.bind(enrollmentController);
exports.default = enrollmentController;
