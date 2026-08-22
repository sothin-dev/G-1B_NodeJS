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
    async GetAllUser(params = {}) {
        return await user_repository_1.default.searchUsers(params);
    }
    async createUser(data) {
        const existingUser = await user_repository_1.default.findByEmail(data.email);
        if (existingUser) {
            throw new app_error_1.AppError("Email already exists", 409);
        }
        const hashedPassword = await (0, hash_password_1.hashPassword)(data.password || "Password123!");
        const firstName = data.firstName || data.email.split("@")[0];
        const lastName = data.lastName || "";
        const user = await user_repository_1.default.create({
            firstName,
            lastName,
            password: hashedPassword,
            email: data.email,
            isActive: data.isActive !== undefined ? data.isActive : true,
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
                userId: user.id,
                departmentId: data.departmentId,
                studentNumber: data.studentNumber || `STU-${Date.now().toString().slice(-6)}`,
                status: student_entity_1.StudentStatus.ACTIVE,
                enrollmentYear: new Date().getFullYear(),
            });
        }
        return await user_repository_1.default.findById(user.id);
    }
    async UpdateUser(ID, data) {
        const user = await user_repository_1.default.findById(ID);
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const payload = {};
        if (data.firstName !== undefined)
            payload.firstName = data.firstName;
        if (data.lastName !== undefined)
            payload.lastName = data.lastName;
        if (data.email !== undefined)
            payload.email = data.email;
        if (data.isActive !== undefined)
            payload.isActive = data.isActive;
        if (data.roleId !== undefined)
            payload.roleId = data.roleId;
        if (data.password) {
            payload.password = await (0, hash_password_1.hashPassword)(data.password);
        }
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
