import { Request, Response, NextFunction } from "express";
import rolePermissionService from "../services/role-permission.service";
import { successResponse } from "../utils/api-response";

class RolePermissionController {
  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await rolePermissionService.getAllRoles();
      return successResponse(res, "List of roles", data);
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await rolePermissionService.createRole(req.body);
      return successResponse(res, "Role created successfully", role, 201);
    } catch (error) {
      next(error);
    }
  }

  async getRolePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await rolePermissionService.getRoleWithPermissions(req.params.id);
      return successResponse(res, "Role and its permission", role);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await rolePermissionService.updateRole(req.params.id, req.body);
      return successResponse(res, "Role updated successfully", role);
    } catch (error) {
      next(error);
    }
  }

  async assignPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await rolePermissionService.assignPermissions(
        req.params.id,
        req.body.permissionIds,
      );
      return successResponse(res, "Permissions assigned successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async removePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, permId } = req.params;
      await rolePermissionService.removePermission(id, permId);
      return successResponse(res, "Permission removed successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new RolePermissionController();
