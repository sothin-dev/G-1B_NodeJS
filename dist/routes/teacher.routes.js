"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = __importDefault(require("../controllers/teacher.controller"));
const role_middleware_1 = require("../middleware/role.middleware");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), teacher_controller_1.default.getAllTeachers);
router.post("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), teacher_controller_1.default.createTeacher);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), teacher_controller_1.default.showTeacher);
router.patch("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN), teacher_controller_1.default.updateTeacher);
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN), teacher_controller_1.default.deleteTeacher);
router.get("/:id/courses", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN, roles_1.Roles.TEACHER), teacher_controller_1.default.listTeacherCourses);
exports.default = router;
