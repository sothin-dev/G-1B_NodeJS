"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = __importDefault(require("../controllers/student.controller"));
const role_middleware_1 = require("../middleware/role.middleware");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN, roles_1.Roles.TEACHER), student_controller_1.default.getAllStudents);
router.post("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), student_controller_1.default.createStudent);
router.get("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN, roles_1.Roles.STUDENT), student_controller_1.default.showStudent);
router.get("/:id/enrollments", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN, roles_1.Roles.STUDENT), student_controller_1.default.getStudentEnrollmentHistory);
router.get("/:id/grades", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN, roles_1.Roles.STUDENT), student_controller_1.default.getStudentGrades);
exports.default = router;
