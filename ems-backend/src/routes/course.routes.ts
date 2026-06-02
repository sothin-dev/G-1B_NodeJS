import { Router } from "express";
import courseController from "../controllers/course.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get("/", authMiddleware, courseController.listCourses);


router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  courseController.createCourse,
);

export default router;
