"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const hash_password_1 = require("../utils/hash-password");
const app_error_1 = require("../core/errors/app-error");
const user_repository_1 = __importDefault(require("../repository/user.repository"));
const teacher_repository_1 = __importDefault(require("../repository/teacher.repository"));
const student_repository_1 = __importDefault(require("../repository/student.repository"));
const role_repository_1 = __importDefault(require("../repository/role.repository"));
const student_entity_1 = require("../entities/student.entity");
class UserService {
    async GetAllUser() {
        const data = await user_repository_1.default.findAll();
        return data;
    }
    async createUser(data) {
        const existingUser = await user_repository_1.default.findByEmail(data.email);
        if (existingUser) {
            throw new app_error_1.AppError("Email already exists", 409);
        }
        const hashedPassword = await (0, hash_password_1.hashPassword)(data.password);
        const user = await user_repository_1.default.create({
            first_name: data.firstName,
            last_name: data.lastName,
            password: hashedPassword,
            email: data.email,
            is_active: data.isActive,
            roleId: data.roleId,
        });
        // create profile based on role
        const role = await role_repository_1.default.findById(data.roleId);
        if (!role) {
            throw new app_error_1.AppError("Role not found", 404);
        }
        if (role.name === "TEACHER") {
            await teacher_repository_1.default.create({
                userId: user.id,
                departmentId: data.departmentId,
            });
        }
        if (role.name === "STUDENT") {
            await student_repository_1.default.create({
                user: { id: user.id },
                departmentId: data.departmentId,
                student_number: data.studentNumber,
                status: student_entity_1.StudentStatus.ACTIVE,
                enrollment_year: new Date().getFullYear(),
            });
        }
        return user;
    }
    async UpdateUser(ID, data) {
        const user = await user_repository_1.default.findById(ID);
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const payload = {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            is_active: data.isActive,
            roleId: data.roleId,
        };
        return await user_repository_1.default.update(ID, payload);
    }
    async deactivateUser(userId) {
        const result = await user_repository_1.default.Deactivate(userId);
        if (result.affected === 0) {
            throw new app_error_1.AppError("User not found", 404);
        }
        return {
            message: "User deactivated successfully",
        };
    }
    async reactivateUser(userId) {
        const result = await user_repository_1.default.Reactivate(userId);
        if (result.affected === 0) {
            throw new app_error_1.AppError("User not found", 404);
        }
        return {
            message: "User reactivated successfully",
        };
    }
}
exports.default = new UserService;
