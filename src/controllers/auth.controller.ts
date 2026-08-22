import { NextFunction, Request, Response } from "express";

import authService from "../services/auth.service";

import { successResponse } from "../utils/api-response";

import activityLogService from "../services/activity-log.service";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      await activityLogService.logActivity(result.id, "USER_REGISTERED", { email: result.email, role: result.role });
      return successResponse(res, "Register successful", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      await activityLogService.logActivity(result.user?.id, "USER_LOGGED_IN", { email: result.user?.email, role: result.user?.role });
      return successResponse(res, "Login successful", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getCurrentUser((req as any).user.id);

      return successResponse(res, "Current user retrieved", result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout((req as any).user.id);
      await activityLogService.logActivity((req as any).user?.id, "USER_LOGGED_OUT");
      return successResponse(res, "Logout successful", null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
