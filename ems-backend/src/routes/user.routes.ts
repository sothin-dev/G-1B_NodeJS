import { Router } from "express";

import userController from "../controllers/user.controller";

import { authorizeRoles } from "../middleware/role.middleware";

import authMiddleware from "../middleware/auth.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  userController.getAllUsers,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  userController.createUser,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  userController.updateUser,
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  userController.deactivateUser,
);

router.patch(
  "/:id/reactivate",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  userController.reactivateUser,
);

export default router;
