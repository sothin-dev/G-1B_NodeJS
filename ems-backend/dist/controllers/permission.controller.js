"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permission_service_1 = __importDefault(require("../services/permission.service"));
const api_response_1 = require("../utils/api-response");
class PermissionController {
    constructor() {
        /**
         * GET /permissions
         */
        this.getPermissions = async (req, res, next) => {
            try {
                const data = await permission_service_1.default.getPermissionsGrouped();
                return (0, api_response_1.successResponse)(res, "Permissions retrieved successfully", data);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new PermissionController();
