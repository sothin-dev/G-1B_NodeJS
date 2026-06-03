"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherService = void 0;
const auth_repository_1 = __importDefault(require("../repository/auth.repository"));
const teacher_repository_1 = require("../repository/teacher.repository");
const roles_1 = require("../constants/roles");
class TeacherService {
    constructor() {
        this.teacherRepo = new teacher_repository_1.TeacherRepository();
    }
    async listTeachers() {
        return await this.teacherRepo.findAll();
    }
    async getTeacherById(id) {
        const teacher = await this.teacherRepo.findById(id);
        if (!teacher)
            throw new Error('Teacher not found');
        return teacher;
    }
    async createTeacher(data) {
        if (!data.userId) {
            throw new Error('userId is required to create a teacher');
        }
        const user = await auth_repository_1.default.findById(data.userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role?.name !== roles_1.Roles.TEACHER) {
            throw new Error('User must have TEACHER role to become a teacher profile');
        }
        const existingTeacher = await this.teacherRepo.findByUserId(data.userId);
        if (existingTeacher) {
            throw new Error('Teacher profile already exists for this user');
        }
        return await this.teacherRepo.create(data);
    }
    async updateTeacher(id, data) {
        const teacher = await this.teacherRepo.update(id, data);
        if (!teacher)
            throw new Error('Teacher not found');
        return teacher;
    }
    async deleteTeacher(id) {
        const deleted = await this.teacherRepo.delete(id);
        if (!deleted)
            throw new Error('Teacher not found');
    }
}
exports.TeacherService = TeacherService;
