"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    async register(req, res) {
        const result = await auth_service_1.default.register(req.body);
        return res.status(201).json({
            success: true,
            message: "Register successful",
            data: result,
        });
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_1.default.login(req.body);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            await auth_service_1.default.logout(req.user.id);
            return res.status(200).json({
                success: true,
                message: "Logout successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
