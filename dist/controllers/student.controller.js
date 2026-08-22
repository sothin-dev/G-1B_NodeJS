"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const student_service_1 = __importDefault(require("../services/student.service"));
const api_response_1 = require("../utils/api-response");
const student_repository_1 = __importDefault(require("../repository/student.repository"));
const app_error_1 = require("../core/errors/app-error");
class StudentController {
    async assertStudentCanAccess(req, studentId) {
        if (req.user?.role !== "STUDENT") {
            return;
        }
        if (!req.user.id) {
            throw new app_error_1.AppError("Unauthorized", 401);
        }
        const student = await student_repository_1.default.findByUserId(req.user.id);
        if (!student) {
            throw new app_error_1.AppError("Student profile not found for this account", 404);
        }
        if (student.id !== studentId) {
            throw new app_error_1.AppError("Forbidden", 403);
        }
    }
    async getAllStudents(req, res, next) {
        try {
            const data = await student_service_1.default.getAllStudents({
                search: req.query.search,
                departmentId: req.query.departmentId,
                status: req.query.status,
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
            });
            if (data && typeof data === 'object' && 'items' in data) {
                return res.status(200).json({
                    success: true,
                    message: "List of Students",
                    data: data.items,
                    meta: data.meta,
                });
            }
            return (0, api_response_1.successResponse)(res, "List of Students", data);
        }
        catch (error) {
            next(error);
        }
    }
    async createStudent(req, res, next) {
        try {
            const student = await student_service_1.default.createStudent(req.body);
            return (0, api_response_1.successResponse)(res, "Student created successfully", student, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async showStudent(req, res, next) {
        try {
            await this.assertStudentCanAccess(req, req.params.id);
            const student = await student_service_1.default.showStudent(req.params.id);
            return (0, api_response_1.successResponse)(res, "Student detail information", student);
        }
        catch (error) {
            next(error);
        }
    }
    async getStudentEnrollmentHistory(req, res, next) {
        try {
            await this.assertStudentCanAccess(req, req.params.id);
            const history = await student_service_1.default.getStudentEnrollmentHistory(req.params.id);
            return (0, api_response_1.successResponse)(res, "Student enrollment history", history);
        }
        catch (error) {
            next(error);
        }
    }
    async getStudentGrades(req, res, next) {
        try {
            await this.assertStudentCanAccess(req, req.params.id);
            const grades = await student_service_1.default.getStudentGrades(req.params.id);
            return (0, api_response_1.successResponse)(res, "Student grades retrieved", grades);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new StudentController();
