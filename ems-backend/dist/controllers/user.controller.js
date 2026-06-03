"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const api_response_1 = require("../utils/api-response");
class UserController {
    constructor() {
        /**
         * Get all users
         */
        this.getAllUsers = async (req, res, next) => {
            try {
                const data = await user_service_1.default.getAllUsers();
                return (0, api_response_1.successResponse)(res, "Users retrieved successfully", data);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Create users
         */
        this.createUser = async (req, res, next) => {
            try {
                const user = await user_service_1.default.createUser(req.body);
                return (0, api_response_1.successResponse)(res, "User created successfully", user, 201);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * update users
         */
        this.updateUser = async (req, res, next) => {
            try {
                const result = await user_service_1.default.updateUser(req.params.id, req.body);
                return (0, api_response_1.successResponse)(res, "User updated successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Deactivate users (supend)
         */
        this.deactivateUser = async (req, res, next) => {
            try {
                const result = await user_service_1.default.deactivateUser(req.params.id);
                return (0, api_response_1.successResponse)(res, result.message);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Active user again
         */
        this.reactivateUser = async (req, res, next) => {
            try {
                const result = await user_service_1.default.reactivateUser(req.params.id);
                return (0, api_response_1.successResponse)(res, result.message);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new UserController();
