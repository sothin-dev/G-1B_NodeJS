"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_repository_1 = __importDefault(require("../repository/auth.repository"));
const hash_password_1 = require("../utils/hash-password");
const generate_token_1 = require("../utils/generate-token");
const roles_1 = require("../constants/roles");
const role_repository_1 = __importDefault(require("../repository/role.repository"));
class AuthService {
    async register(data) {
        const existingUser = await auth_repository_1.default.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }
        const hashedPassword = await (0, hash_password_1.hashPassword)(data.password);
        const studentRole = await role_repository_1.default.findByName(roles_1.Roles.STUDENT);
        if (!studentRole) {
            throw new Error("Student role not found");
        }
        const user = await auth_repository_1.default.create({
            email: data.email,
            password: hashedPassword,
            role: studentRole
        });
        return {
            id: user.id,
            email: user.email,
            role: user.role.name
        };
    }
    async login(data) {
        const user = await auth_repository_1.default.findByEmail(data.email);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isMatch = await (0, hash_password_1.comparePassword)(data.password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        const accessToken = (0, generate_token_1.generateAccessToken)(payload);
        const refreshToken = (0, generate_token_1.generateRefreshToken)(payload);
        await auth_repository_1.default.updateRefreshToken(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken
        };
    }
    async logout(userId) {
        const user = await auth_repository_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        await auth_repository_1.default.updateRefreshToken(userId, "");
        return true;
    }
}
exports.default = new AuthService();
