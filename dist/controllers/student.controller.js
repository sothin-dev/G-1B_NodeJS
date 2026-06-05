"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const student_service_1 = __importDefault(require("../services/student.service"));
const api_response_1 = require("../utils/api-response");
class StudentController {
    async getAllStudents(req, res, next) {
        try {
            const data = await student_service_1.default.getAllStudents();
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
            const student = await student_service_1.default.showStudent(req.params.id);
            return (0, api_response_1.successResponse)(res, "Student detail information", student);
        }
        catch (error) {
            next(error);
        }
    }
    async getStudentEnrollmentHistory(req, res, next) {
        try {
            const history = await student_service_1.default.getStudentEnrollmentHistory(req.params.id);
            return (0, api_response_1.successResponse)(res, "Student enrollment history", history);
        }
        catch (error) {
            next(error);
        }
    }
    async getStudentGrades(req, res, next) {
        try {
            const grades = await student_service_1.default.getStudentGrades(req.params.id);
            return (0, api_response_1.successResponse)(res, "Student grades retrieved", grades);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new StudentController();
