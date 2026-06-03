"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_error_1 = require("../core/errors/app-error");
const role_repository_1 = __importDefault(require("../repository/role.repository"));
const role_permission_repository_1 = __importDefault(require("../repository/role-permission.repository"));
class RoleService {
    /**
     * Get all role for admin and super admin
     */
    async getAllRoles() {
        const roles = await role_repository_1.default.findAll();
        return roles;
    }
    /**
     * Create role (only admin and super admi can acces)
     */
    async createRole(data) {
        const existingRole = await role_repository_1.default.findByName(data.name);
        if (existingRole) {
            throw new app_error_1.AppError("this role is alread created", 409);
        }
        const role = await role_repository_1.default.create({
            name: data.name,
        });
        return role;
    }
    /**
     * get role with permission assigned
     */
    async getRoleWithPermissions(roleId) {
        const role = await role_repository_1.default.findRoleWithPermissions(roleId);
        if (!role) {
            throw new app_error_1.AppError("Role not found", 404);
        }
        return role;
    }
    /**
     * update role name
     */
    async updateRole(roleId, data) {
        const existingRole = await role_repository_1.default.findById(roleId);
        if (!existingRole) {
            throw new app_error_1.AppError("This role is not found", 404);
        }
        const role = await role_repository_1.default.update(roleId, { name: data.name });
        return role;
    }
    /**
     * Asign one or more permission to a role by role id
     */
    async assignPermissions(roleId, permissionIds) {
        const role = await role_repository_1.default.findById(roleId);
        if (!role) {
            throw new app_error_1.AppError("Role not found", 404);
        }
        const existing = await role_permission_repository_1.default.findByRoleId(roleId);
        const existingIds = existing.map((p) => p.permission_id);
        const newPermissions = permissionIds.filter((id) => !existingIds.includes(id));
        const payload = newPermissions.map((permissionId) => ({
            role_id: roleId,
            permission_id: permissionId,
        }));
        return await role_permission_repository_1.default.createMany(payload);
    }
    /**
     * Remove permission from role
     */
    async removePermission(roleId, permissionId) {
        const existing = await role_permission_repository_1.default.findOneByRoleAndPermission(roleId, permissionId);
        if (!existing) {
            throw new app_error_1.AppError("Permission not assigned to role", 404);
        }
        await role_permission_repository_1.default.deleteRolePermission(roleId, permissionId);
        return true;
    }
}
exports.default = new RoleService();
