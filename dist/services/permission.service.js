"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const permission_repository_1 = __importDefault(require("../repository/permission.repository"));
class PermissionService {
    async getPermissionsGrouped() {
        const permissions = await permission_repository_1.default.findAllPermission();
        if (!permissions.length) {
            return {};
        }
        const grouped = permissions.reduce((acc, permission) => {
            const module = permission.module;
            if (!acc[module]) {
                acc[module] = [];
            }
            acc[module].push({
                id: permission.id,
                name: permission.name,
            });
            return acc;
        }, {});
        return grouped;
    }
}
exports.default = new PermissionService();
