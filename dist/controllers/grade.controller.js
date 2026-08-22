"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grade_service_1 = __importDefault(require("../services/grade.service"));
const api_response_1 = require("../utils/api-response");
const database_1 = require("../config/database");
const student_entity_1 = require("../entities/student.entity");
const app_error_1 = require("../core/errors/app-error");
class GradeController {
    async resolveCurrentStudentId(req) {
        const user = req.user;
        if (user?.role !== 'STUDENT') {
            return null;
        }
        if (!user.id) {
            throw new app_error_1.AppError('Unauthorized', 401);
        }
        const student = await database_1.AppDataSource.getRepository(student_entity_1.Student).findOne({
            where: { user: { id: user.id } },
        });
        if (!student) {
            throw new app_error_1.AppError('Student profile not found for this account', 404);
        }
        return String(student.id);
    }
    async listGrades(req, res, next) {
        try {
            let studentId = req.query.studentId;
            const currentStudentId = await this.resolveCurrentStudentId(req);
            if (currentStudentId) {
                studentId = currentStudentId;
            }
            const result = await grade_service_1.default.listGrades({
                courseId: req.query.courseId,
                studentId,
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
            const currentStudentId = await this.resolveCurrentStudentId(req);
            if (currentStudentId && result.studentId !== currentStudentId) {
                throw new app_error_1.AppError('Forbidden', 403);
            }
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
