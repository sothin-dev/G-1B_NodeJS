import {
  Request,
  Response,
  NextFunction,
} from "express";

import userService from "../services/user.service";

import {
  successResponse,
} from "../utils/api-response";

class UserController {

  /**
   * Get all users
   */
  getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data =
        await userService.GetAllUser();

      return successResponse(
        res,
        "Users retrieved successfully",
        data
      );

    } catch (error) {
      next(error);
    }
  };

  /**
   * Create users
   */
  createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user =
        await userService.createUser(
          req.body
        );

      return successResponse(
        res,
        "User created successfully",
        user,
        201
      );

    } catch (error) {
      next(error);
    }
  };

  /**
   * update users
   */
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await userService.UpdateUser(
          req.params.id,
          req.body
        );

      return successResponse(
        res,
        "User updated successfully",
        result
      );

    } catch (error) {
      next(error);
    }
  };

  /**
   * Deactivate users (supend)
   */
  deactivateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      const result =
        await userService.deactivateUser(
          req.params.id
        );

      return successResponse(
        res,
        result.message
      );

    } catch (error) {
      next(error);
    }
  };

  /**
   * Active user again
   */
  reactivateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      const result =
        await userService.reactivateUser(
          req.params.id
        );

      return successResponse(
        res,
        result.message
      );

    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();