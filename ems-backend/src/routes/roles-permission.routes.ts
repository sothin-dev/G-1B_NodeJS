import { Router } from "express";

import rolePermissionController from "../controllers/role-permission.controller";

import { authorizeRoles } from "../middleware/role.middleware";
import authMiddleware from "../middleware/auth.middleware";
import { AssignPermissionsDto } from "../dto/rolePermission.dto";
import { Roles } from "../constants/roles";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  rolePermissionController.getAllRoles,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  rolePermissionController.createRole,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  rolePermissionController.getRolePermission,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("SUPER_ADMIN", "ADMIN"),
  rolePermissionController.updateRole,
);

router.post(
  "/:id/permissions",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  rolePermissionController.assignPermissions
);

export default router;
