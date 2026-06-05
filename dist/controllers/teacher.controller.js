"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const teacher_service_1 = __importDefault(require("../services/teacher.service"));
const api_response_1 = require("../utils/api-response");
class TeacherController {
    async getAllTeachers(req, res, next) {
        try {
            const data = await teacher_service_1.default.getAllTeachers(req.query.departmentId);
            return (0, api_response_1.successResponse)(res, "Teachers retrieved", data);
        }
        catch (error) {
            next(error);
        }
    }
    async createTeacher(req, res, next) {
        try {
            const data = await teacher_service_1.default.createTeacher(req.body);
            return (0, api_response_1.successResponse)(res, "Teacher created successfully", data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async showTeacher(req, res, next) {
        try {
            const data = await teacher_service_1.default.showTeacher(req.params.id);
            return (0, api_response_1.successResponse)(res, "Teacher retrieved", data);
        }
        catch (error) {
            next(error);
        }
    }
    async updateTeacher(req, res, next) {
        try {
            const data = await teacher_service_1.default.updateTeacher(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, "Teacher updated", data);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTeacher(req, res, next) {
        try {
            const data = await teacher_service_1.default.deleteTeacher(req.params.id);
            return (0, api_response_1.successResponse)(res, data.message);
        }
        catch (error) {
            next(error);
        }
    }
    async listTeacherCourses(req, res, next) {
        try {
            const data = await teacher_service_1.default.listTeacherCourses(req.params.id);
            return (0, api_response_1.successResponse)(res, "Teacher courses", data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TeacherController();
