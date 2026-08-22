import { Router } from "express";
import courseController from "../controllers/course.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get("/", authMiddleware, courseController.listCourses);

router.get("/:id", authMiddleware, courseController.getCourseDetails);

router.get("/:id/schedules", authMiddleware, courseController.listCourseSchedules);

router.get(
  "/:id/students",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER),
  courseController.listCourseStudents,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  courseController.createCourse,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  courseController.updateCourse,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  courseController.deleteCourse,
);

export default router;
