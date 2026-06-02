import { Router } from "express";

import studentController from "../controllers/student.controller";

import { authorizeRoles } from "../middleware/role.middleware";

import authMiddleware from "../middleware/auth.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
    '/',
    authMiddleware,
    authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.TEACHER),
    studentController.getAllStudents
)

router.post(
    '/',
    authMiddleware,
    authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
    studentController.createStudent
)

router.get(
    '/:id',
    authMiddleware,
    authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.STUDENT),
    studentController.showStudent
)

export default router;