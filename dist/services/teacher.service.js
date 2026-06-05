"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const app_error_1 = require("../core/errors/app-error");
const department_entity_1 = require("../entities/department.entity");
const role_entity_1 = require("../entities/role.entity");
const teacher_entity_1 = require("../entities/teacher.entity");
const user_entity_1 = require("../entities/user.entity");
const course_repository_1 = __importDefault(require("../repository/course.repository"));
const teacher_repository_1 = __importDefault(require("../repository/teacher.repository"));
class TeacherService {
    async getAllTeachers(departmentId) {
        if (departmentId) {
            const department = await database_1.AppDataSource.getRepository(department_entity_1.Department).findOne({
                where: { id: departmentId },
            });
            if (!department) {
                throw new app_error_1.AppError("Department not found", 404);
            }
            return database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).find({
                where: { department: { id: departmentId } },
                relations: ["user", "department"],
                order: { created_at: "DESC" },
            });
        }
        return database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).find({
            relations: ["user", "department"],
            order: { created_at: "DESC" },
        });
    }
    async createTeacher(data) {
        const user = await database_1.AppDataSource.getRepository(user_entity_1.User).findOne({
            where: { id: data.user_id },
            relations: ["role"],
        });
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const existingTeacher = await teacher_repository_1.default.findByUserId(data.user_id);
        if (existingTeacher) {
            throw new app_error_1.AppError("Teacher already exists for this user", 409);
        }
        if (data.department_id) {
            const department = await database_1.AppDataSource.getRepository(department_entity_1.Department).findOne({
                where: { id: data.department_id },
            });
            if (!department) {
                throw new app_error_1.AppError("Department not found", 404);
            }
        }
        const teacherRole = await database_1.AppDataSource.getRepository(role_entity_1.Role).findOne({
            where: { name: "TEACHER" },
        });
        if (teacherRole && user.roleId !== teacherRole.id) {
            await database_1.AppDataSource.getRepository(user_entity_1.User).update(user.id, {
                roleId: teacherRole.id,
            });
        }
        return teacher_repository_1.default.create({
            user: { id: user.id },
            department: data.department_id ? { id: data.department_id } : undefined,
        });
    }
    async showTeacher(id) {
        const teacher = await teacher_repository_1.default.findById(id);
        if (!teacher) {
            throw new app_error_1.AppError("Teacher not found", 404);
        }
        return teacher;
    }
    async updateTeacher(id, data) {
        const teacher = await teacher_repository_1.default.findById(id);
        if (!teacher) {
            throw new app_error_1.AppError("Teacher not found", 404);
        }
        if (data.department_id) {
            const department = await database_1.AppDataSource.getRepository(department_entity_1.Department).findOne({
                where: { id: data.department_id },
            });
            if (!department) {
                throw new app_error_1.AppError("Department not found", 404);
            }
        }
        return teacher_repository_1.default.update(id, {
            departmentId: data.department_id ?? teacher.departmentId,
        });
    }
    async deleteTeacher(id) {
        const teacher = await teacher_repository_1.default.findById(id);
        if (!teacher) {
            throw new app_error_1.AppError("Teacher not found", 404);
        }
        await teacher_repository_1.default.delete(id);
        return { message: "Teacher deleted successfully" };
    }
    async listTeacherCourses(id) {
        const teacher = await teacher_repository_1.default.findById(id);
        if (!teacher) {
            throw new app_error_1.AppError("Teacher not found", 404);
        }
        return course_repository_1.default.listCourses({ teacherId: id });
    }
}
exports.default = new TeacherService();
