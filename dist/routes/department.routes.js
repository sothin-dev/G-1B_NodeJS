"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = __importDefault(require("../controllers/department.controller"));
const role_middleware_1 = require("../middleware/role.middleware");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), department_controller_1.default.getAllDepartments);
router.post("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), department_controller_1.default.createDepartment);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), department_controller_1.default.getDepartment);
router.patch("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), department_controller_1.default.updateDepartment);
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN), department_controller_1.default.deleteDepartment);
router.get("/:id/courses", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), department_controller_1.default.listCourses);
router.get("/:id/teachers", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), department_controller_1.default.listTeachers);
exports.default = router;
