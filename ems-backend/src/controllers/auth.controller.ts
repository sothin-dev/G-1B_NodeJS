import { NextFunction, Request, Response } from "express";

import authService from "../services/auth.service";

class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "Register successful",
      data: result,
    });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout((req as any).user.id);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
