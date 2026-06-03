"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enroll = void 0;
const enrollment_service_1 = require("../services/enrollment.service");
const api_response_1 = require("../utils/api-response");
const enrollmentService = new enrollment_service_1.EnrollmentService();
class EnrollmentController {
    async listEnrollments(req, res, next) {
        try {
            const result = await enrollmentService.listEnrollments({
                studentId: req.query.studentId,
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
            const studentId = (req.user?.id && req.user.role === 'STUDENT') ? req.user.id : req.body.studentId;
            const semesterId = req.body.semesterId;
            const courseIds = Array.isArray(req.body.courseIds)
                ? req.body.courseIds
                : req.body.courseId
                    ? [req.body.courseId]
                    : [];
            const result = await enrollmentService.enroll(studentId, semesterId, courseIds);
            return (0, api_response_1.successResponse)(res, "Enrolled successfully", result, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getEnrollment(req, res, next) {
        try {
            const result = await enrollmentService.getEnrollment(req.params.id);
            return (0, api_response_1.successResponse)(res, "Enrollment details", result);
        }
        catch (error) {
            next(error);
        }
    }
    async approveEnrollment(req, res, next) {
        try {
            const result = await enrollmentService.approve(req.params.id);
            return (0, api_response_1.successResponse)(res, "Enrollment approved", result);
        }
        catch (error) {
            next(error);
        }
    }
    async rejectEnrollment(req, res, next) {
        try {
            const result = await enrollmentService.reject(req.params.id, req.body?.reason);
            return (0, api_response_1.successResponse)(res, "Enrollment rejected", result);
        }
        catch (error) {
            next(error);
        }
    }
    async cancelEnrollment(req, res, next) {
        try {
            const studentId = req.user?.role === 'STUDENT' ? req.user.id : req.body.studentId;
            const result = await enrollmentService.cancel(req.params.id, studentId);
            return (0, api_response_1.successResponse)(res, "Enrollment cancelled", result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyCourses(req, res, next) {
        try {
            const result = await enrollmentService.getMyCourses(req.user.id, req.query.semesterId);
            return (0, api_response_1.successResponse)(res, "Student enrolled courses", result);
        }
        catch (error) {
            next(error);
        }
    }
    async validateSelection(req, res, next) {
        try {
            const studentId = req.user?.role === 'STUDENT' ? req.user.id : req.body.studentId;
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
