"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_permission_service_1 = __importDefault(require("../services/role-permission.service"));
const api_response_1 = require("../utils/api-response");
class RolePermissionController {
    constructor() {
        /**
         * Get all roles
         */
        this.getAllRoles = async (req, res, next) => {
            try {
                const data = await role_permission_service_1.default.getAllRoles();
                return (0, api_response_1.successResponse)(res, "List of roles", data);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * create New role
         */
        this.createRole = async (req, res, next) => {
            try {
                const role = await role_permission_service_1.default.createRole(req.body);
                return (0, api_response_1.successResponse)(res, "Role created successfully", role, 201);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Get role with permission
         */
        this.getRolePermission = async (req, res, next) => {
            try {
                const role = await role_permission_service_1.default.getRoleWithPermissions(req.params.id);
                return (0, api_response_1.successResponse)(res, "Role and its permission", role);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * update role
         */
        this.updateRole = async (req, res, next) => {
            try {
                const role = await role_permission_service_1.default.updateRole(req.params.id, req.body);
                return (0, api_response_1.successResponse)(res, "Role updated successfully", role);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * assign permissions to a role
         */
        this.assignPermissions = async (req, res, next) => {
            try {
                const { id } = req.params;
                const result = await role_permission_service_1.default.assignPermissions(id, req.body.permissionIds);
                return (0, api_response_1.successResponse)(res, "Permissions assigned successfully", result);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Remove permission from role
         */
        this.removePermission = async (req, res, next) => {
            try {
                const { id, permId } = req.params;
                await role_permission_service_1.default.removePermission(id, permId);
                return (0, api_response_1.successResponse)(res, "Permission removed successfully");
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new RolePermissionController();
