"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const department_service_1 = __importDefault(require("../services/department.service"));
const api_response_1 = require("../utils/api-response");
class DepartmentController {
    async getAllDepartments(req, res, next) {
        try {
            const data = await department_service_1.default.getAllDepartments();
            return (0, api_response_1.successResponse)(res, "Departments retrieved", data);
        }
        catch (error) {
            next(error);
        }
    }
    async createDepartment(req, res, next) {
        try {
            const data = await department_service_1.default.createDepartment(req.body);
            return (0, api_response_1.successResponse)(res, "Department created", data, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getDepartment(req, res, next) {
        try {
            const data = await department_service_1.default.getDepartment(req.params.id);
            return (0, api_response_1.successResponse)(res, "Department retrieved", data);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDepartment(req, res, next) {
        try {
            const data = await department_service_1.default.updateDepartment(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, "Department updated", data);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDepartment(req, res, next) {
        try {
            const data = await department_service_1.default.deleteDepartment(req.params.id);
            return (0, api_response_1.successResponse)(res, data.message);
        }
        catch (error) {
            next(error);
        }
    }
    async listCourses(req, res, next) {
        try {
            const data = await department_service_1.default.listCourses(req.params.id);
            return (0, api_response_1.successResponse)(res, "Department courses", data);
        }
        catch (error) {
            next(error);
        }
    }
    async listTeachers(req, res, next) {
        try {
            const data = await department_service_1.default.listTeachers(req.params.id);
            return (0, api_response_1.successResponse)(res, "Department teachers", data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DepartmentController();
