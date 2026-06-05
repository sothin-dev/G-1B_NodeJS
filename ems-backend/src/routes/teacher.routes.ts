import { Router } from "express";

import teacherController from "../controllers/teacher.controller";
import { authorizeRoles } from "../middleware/role.middleware";
import authMiddleware from "../middleware/auth.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  teacherController.getAllTeachers,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  teacherController.createTeacher,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  teacherController.showTeacher,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  teacherController.updateTeacher,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN),
  teacherController.deleteTeacher,
);

router.get(
  "/:id/courses",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER),
  teacherController.listTeacherCourses,
);

export default router;
