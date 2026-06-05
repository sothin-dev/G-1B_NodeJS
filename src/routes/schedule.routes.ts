import { Router } from "express";
import scheduleController from "../controllers/schedule.controller";
import { authorizeRoles } from "../middleware/role.middleware";
import authMiddleware from "../middleware/auth.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  scheduleController.listSchedules,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  scheduleController.createSchedule,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  scheduleController.getScheduleDetails,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  scheduleController.updateSchedule,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  scheduleController.deleteSchedule,
);

router.post(
  "/check-conflict",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  scheduleController.checkConflict,
);

export default router;
