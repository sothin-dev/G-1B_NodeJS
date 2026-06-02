import {
  Request,
  Response,
  NextFunction
} from "express";

import permissionService
from "../services/permission.service";

import {
  successResponse
} from "../utils/api-response";

class PermissionController {

  /**
   * GET /permissions
   */
  getPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const data =
        await permissionService.getPermissionsGrouped();

      return successResponse(
        res,
        "Permissions retrieved successfully",
        data
      );

    } catch (error) {
      next(error);
    }

  };

}

export default new PermissionController();