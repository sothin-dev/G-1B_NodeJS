"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/enrollment.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const roles_1 = require("../constants/roles");
const enrollment_controller_1 = require("../controllers/enrollment.controller");
const router = (0, express_1.Router)();
// Student routes
router.post('/', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT), enrollment_controller_1.enroll);
router.post('/enroll', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT), enrollment_controller_1.enroll);
router.post('/validate', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT), enrollment_controller_1.validateEnrollment);
router.get('/my-courses', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT), enrollment_controller_1.myCourses);
router.get('/history', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT), enrollment_controller_1.history);
router.patch('/:id/cancel', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.STUDENT, roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), enrollment_controller_1.cancel);
// Admin routes
router.get('/', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), enrollment_controller_1.list);
router.get('/:id', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN, roles_1.Roles.STUDENT), enrollment_controller_1.getOne);
router.get('/:id/courses', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), enrollment_controller_1.getCourses);
router.post('/bulk-approve', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), enrollment_controller_1.bulkApprove);
router.patch('/:id/approve', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), enrollment_controller_1.approve);
router.patch('/:id/reject', auth_middleware_1.authMiddleware, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.SUPER_ADMIN), enrollment_controller_1.reject);
exports.default = router;
