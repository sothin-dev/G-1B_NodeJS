"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const api_response_1 = require("../utils/api-response");
class UserController {
    async getAllUsers(req, res, next) {
        try {
            const data = await user_service_1.default.GetAllUser({
                search: req.query.search,
                role: req.query.role,
                is_active: req.query.is_active,
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
            });
            if (data && typeof data === 'object' && 'items' in data) {
                return res.status(200).json({
                    success: true,
                    message: "Users retrieved successfully",
                    data: data.items,
                    meta: data.meta,
                });
            }
            return (0, api_response_1.successResponse)(res, "Users retrieved successfully", data);
        }
        catch (error) {
            next(error);
        }
    }
    async createUser(req, res, next) {
        try {
            const user = await user_service_1.default.createUser(req.body);
            return (0, api_response_1.successResponse)(res, "User created successfully", user, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const result = await user_service_1.default.UpdateUser(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, "User updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateUser(req, res, next) {
        try {
            const result = await user_service_1.default.deactivateUser(req.params.id);
            return (0, api_response_1.successResponse)(res, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async reactivateUser(req, res, next) {
        try {
            const result = await user_service_1.default.reactivateUser(req.params.id);
            return (0, api_response_1.successResponse)(res, result.message);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController();
