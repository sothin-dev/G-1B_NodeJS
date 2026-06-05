import { Router } from "express";

import permissionController
from "../controllers/permission.controller";

import { authorizeRoles }
 from "../middleware/role.middleware";

import authMiddleware
 from "../middleware/auth.middleware";

import { Roles }
from "../constants/roles";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  permissionController.getPermissions
);

export default router;