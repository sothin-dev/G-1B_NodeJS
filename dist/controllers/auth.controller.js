"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const api_response_1 = require("../utils/api-response");
const activity_log_service_1 = __importDefault(require("../services/activity-log.service"));
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.default.register(req.body);
            await activity_log_service_1.default.logActivity(result.id, "USER_REGISTERED", { email: result.email, role: result.role });
            return (0, api_response_1.successResponse)(res, "Register successful", result, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_1.default.login(req.body);
            await activity_log_service_1.default.logActivity(result.user?.id, "USER_LOGGED_IN", { email: result.user?.email, role: result.user?.role });
            return (0, api_response_1.successResponse)(res, "Login successful", result, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const result = await auth_service_1.default.getCurrentUser(req.user.id);
            return (0, api_response_1.successResponse)(res, "Current user retrieved", result);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            await auth_service_1.default.logout(req.user.id);
            await activity_log_service_1.default.logActivity(req.user?.id, "USER_LOGGED_OUT");
            return (0, api_response_1.successResponse)(res, "Logout successful", null, 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
