"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const hash_password_1 = require("../utils/hash-password");
const app_error_1 = require("../core/errors/app-error");
const user_repository_1 = __importDefault(require("../repository/user.repository"));
class UserService {
    async GetAllUser() {
        const data = await user_repository_1.default.findAll();
        return data;
    }
    async getAllUsers() {
        return this.GetAllUser();
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
    async updateUser(ID, data) {
        return this.UpdateUser(ID, data);
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
exports.default = new UserService();
