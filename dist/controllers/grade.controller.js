"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grade_service_1 = __importDefault(require("../services/grade.service"));
const api_response_1 = require("../utils/api-response");
class GradeController {
    async listGrades(req, res, next) {
        try {
            const result = await grade_service_1.default.listGrades({
                courseId: req.query.courseId,
                studentId: req.query.studentId,
            });
            return (0, api_response_1.successResponse)(res, 'List of grades', result);
        }
        catch (error) {
            next(error);
        }
    }
    async createGrade(req, res, next) {
        try {
            const result = await grade_service_1.default.createGrade(req.body);
            return (0, api_response_1.successResponse)(res, 'Grade uploaded successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getGrade(req, res, next) {
        try {
            const result = await grade_service_1.default.getGrade(req.params.id);
            return (0, api_response_1.successResponse)(res, 'Grade details', result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateGrade(req, res, next) {
        try {
            const result = await grade_service_1.default.updateGrade(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, 'Grade updated successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteGrade(req, res, next) {
        try {
            const result = await grade_service_1.default.deleteGrade(req.params.id);
            return (0, api_response_1.successResponse)(res, 'Grade deleted successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    async publishGrade(req, res, next) {
        try {
            const result = await grade_service_1.default.publishGrade(req.params.id);
            return (0, api_response_1.successResponse)(res, 'Grades published', result);
        }
        catch (error) {
            next(error);
        }
    }
    async bulkUpload(req, res, next) {
        try {
            const result = await grade_service_1.default.bulkUpload(req.body.courseId, req.body.records ?? []);
            return (0, api_response_1.successResponse)(res, 'Bulk grades uploaded successfully', result, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getGradesByCourse(req, res, next) {
        try {
            const result = await grade_service_1.default.getGradesByCourse(req.params.courseId);
            return (0, api_response_1.successResponse)(res, 'Course grades', result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new GradeController();
