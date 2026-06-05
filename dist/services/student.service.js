"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const student_repository_1 = __importDefault(require("../repository/student.repository"));
const enrollment_repository_1 = __importDefault(require("../repository/enrollment.repository"));
const app_error_1 = require("../core/errors/app-error");
const database_1 = require("../config/database");
const department_entity_1 = require("../entities/department.entity");
const student_entity_1 = require("../entities/student.entity");
const user_entity_1 = require("../entities/user.entity");
const grade_entity_1 = require("../entities/grade.entity");
class StudentService {
    /**
     * Get all students
     */
    async getAllStudents() {
        return database_1.AppDataSource.getRepository(student_entity_1.Student).find({
            relations: ["user", "department"],
        });
    }
    /**
     * Create student
     */
    async createStudent(data) {
        const user = await database_1.AppDataSource.getRepository(user_entity_1.User).findOne({
            where: { id: data.user_id },
        });
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const department = await database_1.AppDataSource.getRepository(department_entity_1.Department).findOne({
            where: { id: data.department_id },
        });
        if (!department) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        const existingStudent = await student_repository_1.default.findByUserId(data.user_id);
        if (existingStudent) {
            throw new app_error_1.AppError("Student already exists for this user", 409);
        }
        return student_repository_1.default.create({
            student_number: data.student_number,
            user: { id: user.id },
            department: { id: department.id },
            status: student_entity_1.StudentStatus.ACTIVE,
            enrollment_year: new Date().getFullYear(),
        });
    }
    /**
     * Show detail student information
     */
    async showStudent(studentId) {
        const student = await student_repository_1.default.findById(studentId);
        if (!student) {
            throw new app_error_1.AppError("This student is not found", 404);
        }
        return student;
    }
    /**
     * Get student enrollment history
     */
    async getStudentEnrollmentHistory(studentId) {
        const student = await student_repository_1.default.findById(studentId);
        if (!student) {
            throw new app_error_1.AppError("This student is not found", 404);
        }
        return enrollment_repository_1.default.getEnrollmentHistory(studentId);
    }
    /**
     * Get all grades for a student across semesters
     */
    async getStudentGrades(studentId) {
        const student = await student_repository_1.default.findById(studentId);
        if (!student) {
            throw new app_error_1.AppError("This student is not found", 404);
        }
        return database_1.AppDataSource.getRepository(grade_entity_1.Grade).find({
            where: {
                student: {
                    id: studentId,
                },
            },
            relations: ["course"],
            order: {
                created_at: "DESC",
            },
        });
    }
}
exports.default = new StudentService();
