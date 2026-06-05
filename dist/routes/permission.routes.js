"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = __importDefault(require("../controllers/permission.controller"));
const role_middleware_1 = require("../middleware/role.middleware");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), permission_controller_1.default.getPermissions);
exports.default = router;
