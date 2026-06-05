"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_service_1 = __importDefault(require("../services/dashboard.service"));
const api_response_1 = require("../utils/api-response");
class DashboardController {
    async getAdminOverview(req, res, next) {
        try {
            const data = await dashboard_service_1.default.getAdminOverview();
            return (0, api_response_1.successResponse)(res, "Admin dashboard overview", data);
        }
        catch (error) {
            next(error);
        }
    }
    async getStudentDashboard(req, res, next) {
        try {
            const data = await dashboard_service_1.default.getStudentDashboard(req.user.id);
            return (0, api_response_1.successResponse)(res, "Student dashboard snapshot", data);
        }
        catch (error) {
            next(error);
        }
    }
    async getTeacherDashboard(req, res, next) {
        try {
            const data = await dashboard_service_1.default.getTeacherDashboard(req.user.id);
            return (0, api_response_1.successResponse)(res, "Teacher dashboard overview", data);
        }
        catch (error) {
            next(error);
        }
    }
    async getEnrollmentTrend(req, res, next) {
        try {
            const data = await dashboard_service_1.default.getEnrollmentTrend();
            return (0, api_response_1.successResponse)(res, "Enrollment trend data", data);
        }
        catch (error) {
            next(error);
        }
    }
    async getDepartmentStats(req, res, next) {
        try {
            const data = await dashboard_service_1.default.getDepartmentStats();
            return (0, api_response_1.successResponse)(res, "Department analytics", data);
        }
        catch (error) {
            next(error);
        }
    }
    async getCourseStats(req, res, next) {
        try {
            const data = await dashboard_service_1.default.getTopCoursesForActiveSemester();
            return (0, api_response_1.successResponse)(res, "Top courses for active semester", data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DashboardController();
