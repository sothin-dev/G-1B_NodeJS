"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const semester_service_1 = __importDefault(require("../services/semester.service"));
const api_response_1 = require("../utils/api-response");
class SemesterController {
    async listSemesters(req, res, next) {
        try {
            const status = req.query.status;
            const year = req.query.year ? Number(req.query.year) : undefined;
            const semesters = await semester_service_1.default.listSemesters(status, year);
            return (0, api_response_1.successResponse)(res, "Semesters retrieved", semesters);
        }
        catch (error) {
            next(error);
        }
    }
    async createSemester(req, res, next) {
        try {
            const semester = await semester_service_1.default.createSemester(req.body);
            return (0, api_response_1.successResponse)(res, "Semester created successfully", semester, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getSemester(req, res, next) {
        try {
            const semester = await semester_service_1.default.getSemester(req.params.id);
            return (0, api_response_1.successResponse)(res, "Semester retrieved", semester);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSemester(req, res, next) {
        try {
            const semester = await semester_service_1.default.updateSemester(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, "Semester updated successfully", semester);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSemester(req, res, next) {
        try {
            const result = await semester_service_1.default.deleteSemester(req.params.id);
            return (0, api_response_1.successResponse)(res, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async openEnrollment(req, res, next) {
        try {
            const semester = await semester_service_1.default.openEnrollment(req.params.id);
            return (0, api_response_1.successResponse)(res, "Semester enrollment opened", semester);
        }
        catch (error) {
            next(error);
        }
    }
    async closeEnrollment(req, res, next) {
        try {
            const semester = await semester_service_1.default.closeEnrollment(req.params.id);
            return (0, api_response_1.successResponse)(res, "Semester enrollment closed", semester);
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveSemester(req, res, next) {
        try {
            const semester = await semester_service_1.default.getActiveSemester();
            return (0, api_response_1.successResponse)(res, "Active semester retrieved", semester);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SemesterController();
