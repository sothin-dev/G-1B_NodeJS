import { NextFunction, Request, Response } from "express";

import authService from "../services/auth.service";

import { successResponse } from "../utils/api-response";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      return successResponse(res, "Register successful", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

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

      return successResponse(res, "Logout successful", null, 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
