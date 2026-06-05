"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const department_repository_1 = __importDefault(require("../repository/department.repository"));
const app_error_1 = require("../core/errors/app-error");
const database_1 = require("../config/database");
const department_entity_1 = require("../entities/department.entity");
const course_entity_1 = require("../entities/course.entity");
const teacher_entity_1 = require("../entities/teacher.entity");
class DepartmentService {
    async getAllDepartments() {
        return database_1.AppDataSource.getRepository(department_entity_1.Department).find();
    }
    async createDepartment(data) {
        const existing = await department_repository_1.default.findByCode(data.code);
        if (existing) {
            throw new app_error_1.AppError("Department code already exists", 409);
        }
        return department_repository_1.default.create({
            name: data.name,
            code: data.code,
        });
    }
    async getDepartment(id) {
        const dept = await department_repository_1.default.findByIdWithRelations(id);
        if (!dept) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        return dept;
    }
    async updateDepartment(id, data) {
        const dept = await department_repository_1.default.findById(id);
        if (!dept) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        if (data.code) {
            const existing = await department_repository_1.default.findByCode(data.code);
            if (existing && existing.id !== id) {
                throw new app_error_1.AppError("Department code already exists", 409);
            }
        }
        return department_repository_1.default.update(id, data);
    }
    async deleteDepartment(id) {
        const dept = await department_repository_1.default.findById(id);
        if (!dept) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        const courseCount = await database_1.AppDataSource.getRepository(course_entity_1.Course).count({
            where: { department: { id } },
        });
        const teacherCount = await database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).count({
            where: { department: { id } },
        });
        if (courseCount > 0 || teacherCount > 0) {
            throw new app_error_1.AppError("Cannot delete department with active courses or teachers", 400);
        }
        await department_repository_1.default.delete(id);
        return { message: "Department deleted successfully" };
    }
    async listCourses(id) {
        const dept = await department_repository_1.default.findById(id);
        if (!dept) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        return database_1.AppDataSource.getRepository(course_entity_1.Course).find({
            where: { department: { id } },
        });
    }
    async listTeachers(id) {
        const dept = await department_repository_1.default.findById(id);
        if (!dept) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        return database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).find({
            where: { department: { id } },
            relations: ["user"],
        });
    }
}
exports.default = new DepartmentService();
