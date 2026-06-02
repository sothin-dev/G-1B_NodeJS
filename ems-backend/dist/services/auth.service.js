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
const student_repository_1 = __importDefault(require("../repository/student.repository"));
const student_entity_1 = require("../entities/student.entity");
class AuthService {
    async register(data) {
        const existingUser = await auth_repository_1.default.findByEmail(data.email);
        if (existingUser) {
            throw new app_error_1.AppError("Email already exists", 409);
        }
        const hashedPassword = await (0, hash_password_1.hashPassword)(data.password);
        // DEFAULT ROLE = STUDENT
        let role = await role_repository_1.default.findByName(roles_1.Roles.STUDENT);
        if (!role) {
            role = await role_repository_1.default.create({
                name: roles_1.Roles.STUDENT,
            });
        }
        const user = await auth_repository_1.default.create({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: hashedPassword,
            roleId: role.id,
        });
        try {
            await student_repository_1.default.create({
                user: { id: user.id },
                status: student_entity_1.StudentStatus.ACTIVE,
                enrollment_year: new Date().getFullYear(),
            });
        }
        catch (err) {
            console.error("STUDENT CREATE ERROR:", err);
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: role.name,
        };
        // const accessToken = generateAccessToken(payload);
        return {
            firstName: user.first_name,
            lastName: user.last_name,
            id: user.id,
            email: user.email,
            role: role.name,
            // Token: accessToken,
        };
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
