import { Request, Response, NextFunction } from "express";

import rolePermissionService from "../services/role-permission.service";
import { successResponse } from "../utils/api-response";

class RolePermissionController {
  /**
   * Get all roles
   */
  getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await rolePermissionService.getAllRoles();

      return successResponse(res, "List of roles", data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * create New role
   */
  createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await rolePermissionService.createRole(req.body);

      return successResponse(res, "Role created successfully", role, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get role with permission
   */
  getRolePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const role = await rolePermissionService.getRoleWithPermissions(
        req.params.id,
      );

      return successResponse(res, "Role and its permission", role);
    } catch (error) {
      next(error);
    }
  };

  /**
   * update role
   */
  updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await rolePermissionService.updateRole(
        req.params.id,
        req.body,
      );

      return successResponse(res, "Role updated successfully", role);
    } catch (error) {
      next(error);
    }
  };

  /**
   * assign permissions to a role
   */
  assignPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const result = await rolePermissionService.assignPermissions(
        id,
        req.body.permissionIds,
      );

      return successResponse(res, "Permissions assigned successfully", result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove permission from role
   */
  removePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id, permId } = req.params;

      await rolePermissionService.removePermission(id, permId);

      return successResponse(res, "Permission removed successfully");
    } catch (error) {
      next(error);
    }
  };
}

export default new RolePermissionController();
