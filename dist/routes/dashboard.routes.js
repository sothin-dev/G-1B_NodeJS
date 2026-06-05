"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = __importDefault(require("../controllers/dashboard.controller"));
const role_middleware_1 = require("../middleware/role.middleware");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get("/admin", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), dashboard_controller_1.default.getAdminOverview);
router.get("/student", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT), dashboard_controller_1.default.getStudentDashboard);
router.get("/teacher", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.TEACHER), dashboard_controller_1.default.getTeacherDashboard);
router.get("/stats/enrollment", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), dashboard_controller_1.default.getEnrollmentTrend);
router.get("/stats/departments", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), dashboard_controller_1.default.getDepartmentStats);
router.get("/stats/courses", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), dashboard_controller_1.default.getCourseStats);
exports.default = router;
