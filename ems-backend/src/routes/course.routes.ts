import { Router } from "express";
import courseController from "../controllers/course.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, courseController.listCourses);

export default router;
