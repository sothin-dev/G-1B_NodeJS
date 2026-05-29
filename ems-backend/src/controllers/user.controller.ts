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