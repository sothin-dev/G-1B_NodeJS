import { Router } from "express";

import departmentController from "../controllers/department.controller";

import { authorizeRoles } from "../middleware/role.middleware";
import authMiddleware from "../middleware/auth.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  departmentController.getAllDepartments,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  departmentController.createDepartment,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  departmentController.getDepartment,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  departmentController.updateDepartment,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN),
  departmentController.deleteDepartment,
);

router.get(
  "/:id/courses",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  departmentController.listCourses,
);

router.get(
  "/:id/teachers",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  departmentController.listTeachers,
);

export default router;
