"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = __importDefault(require("../controllers/course.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const role_middleware_1 = require("../middleware/role.middleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.default, course_controller_1.default.listCourses);
router.get("/:id", auth_middleware_1.default, course_controller_1.default.getCourseDetails);
router.get("/:id/schedules", auth_middleware_1.default, course_controller_1.default.listCourseSchedules);
router.get("/:id/students", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN, roles_1.Roles.ADMIN, roles_1.Roles.TEACHER), course_controller_1.default.listCourseStudents);
router.post("/", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), course_controller_1.default.createCourse);
router.patch("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), course_controller_1.default.updateCourse);
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN), course_controller_1.default.deleteCourse);
exports.default = router;
