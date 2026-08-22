import { Router } from "express";

import authController
from "../controllers/auth.controller";

import  authMiddleware 
from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";

const router = Router();

router.post(
  "/register",
  validateBody(RegisterDto),
  authController.register
);

router.post(
  "/login",
  validateBody(LoginDto),
  authController.login
);

router.get(
  "/me",
  authMiddleware,
  authController.getMe
);

router.post(
  "/logout",
  authMiddleware,
  authController.logout
);

export default router;
