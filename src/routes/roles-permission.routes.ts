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
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  rolePermissionController.getAllRoles,
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  rolePermissionController.createRole,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  rolePermissionController.getRolePermission,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  rolePermissionController.updateRole,
);

router.post(
  "/:id/permissions",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  rolePermissionController.assignPermissions
);

router.delete(
  "/:id/permissions/:permId",
  authMiddleware,
  authorizeRoles(
    Roles.SUPER_ADMIN, Roles.ADMIN
  ),
  rolePermissionController
    .removePermission
);

export default router;
