"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_repository_1 = __importDefault(require("../repository/auth.repository"));
const role_repository_1 = __importDefault(require("../repository/role.repository"));
require("dotenv/config");
const hash_password_1 = require("../utils/hash-password");
const generate_token_1 = require("../utils/generate-token");
const roles_1 = require("../constants/roles");
const app_error_1 = require("../core/errors/app-error");
const student_entity_1 = require("../entities/student.entity");
const database_1 = require("../config/database");
const user_entity_1 = require("../entities/user.entity");
class AuthService {
    async register(data) {
        const existingUser = await auth_repository_1.default.findByEmail(data.email);
        if (existingUser) {
            throw new app_error_1.AppError("Email already exists", 409);
        }
        const role = await role_repository_1.default.findByName(roles_1.Roles.STUDENT);
        if (!role) {
            throw new app_error_1.AppError("Student role not configured", 500);
        }
        const hashedPassword = await (0, hash_password_1.hashPassword)(data.password);
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.save(user_entity_1.User, {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                password: hashedPassword,
                roleId: role.id,
            });
            await queryRunner.manager.save(student_entity_1.Student, {
                user: { id: user.id },
                status: student_entity_1.StudentStatus.ACTIVE,
                enrollment_year: new Date().getFullYear(),
            });
            await queryRunner.commitTransaction();
            return {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: role.name,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async login(data) {
        const user = await auth_repository_1.default.findByEmail(data.email);
        if (!user) {
            throw new app_error_1.AppError("Invalid email or password", 401);
        }
        const isMatch = await (0, hash_password_1.comparePassword)(data.password, user.password);
        if (!isMatch) {
            throw new app_error_1.AppError("Invalid email or password", 401);
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role.name,
        };
        const accessToken = (0, generate_token_1.generateAccessToken)(payload);
        const refreshToken = (0, generate_token_1.generateRefreshToken)(payload);
        await auth_repository_1.default.updateRefreshToken(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role.name,
            },
            accessToken,
            refreshToken,
        };
    }
    async logout(userId) {
        const user = await auth_repository_1.default.findById(userId);
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        if (!user.refresh_token || user.refresh_token.trim() === "") {
            return "User is already logged out";
        }
        await auth_repository_1.default.updateRefreshToken(userId, "");
        return "logout Successful";
    }
}
exports.default = new AuthService();
