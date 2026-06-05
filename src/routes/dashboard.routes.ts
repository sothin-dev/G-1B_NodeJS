import { Router } from "express";

import dashboardController from "../controllers/dashboard.controller";
import { authorizeRoles } from "../middleware/role.middleware";
import authMiddleware from "../middleware/auth.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
  "/admin",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  dashboardController.getAdminOverview,
);

router.get(
  "/student",
  authMiddleware,
  authorizeRoles(Roles.STUDENT),
  dashboardController.getStudentDashboard,
);

router.get(
  "/teacher",
  authMiddleware,
  authorizeRoles(Roles.TEACHER),
  dashboardController.getTeacherDashboard,
);

router.get(
  "/stats/enrollment",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  dashboardController.getEnrollmentTrend,
);

router.get(
  "/stats/departments",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  dashboardController.getDepartmentStats,
);

router.get(
  "/stats/courses",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  dashboardController.getCourseStats,
);

export default router;
