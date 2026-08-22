import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import { successResponse } from "../utils/api-response";

class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.GetAllUser({
        search: req.query.search as string | undefined,
        role: req.query.role as string | undefined,
        is_active: req.query.is_active as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });

      if (data && typeof data === 'object' && 'items' in data) {
        return res.status(200).json({
          success: true,
          message: "Users retrieved successfully",
          data: data.items,
          meta: data.meta,
        });
      }

      return successResponse(res, "Users retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      return successResponse(res, "User created successfully", user, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.UpdateUser(req.params.id, req.body);
      return successResponse(res, "User updated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deactivateUser(req.params.id);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async reactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.reactivateUser(req.params.id);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();