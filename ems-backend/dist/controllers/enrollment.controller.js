"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enroll = void 0;
const enrollment_service_1 = require("../services/enrollment.service");
const enrollmentService = new enrollment_service_1.EnrollmentService();
const enroll = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const semesterId = req.body.semesterId;
        const courseIds = Array.isArray(req.body.courseIds)
            ? req.body.courseIds
            : req.body.courseId
                ? [req.body.courseId]
                : [];
        const result = await enrollmentService.enroll(studentId, semesterId, courseIds);
        res.status(201).json({
            success: true,
            message: 'Enrolled successfully',
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.enroll = enroll;
