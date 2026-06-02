import {
  Request,
  Response,
  NextFunction
} from "express";
import { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: JwtPayload | any;
}

export const authorizeRoles =
(...roles: string[]) =>
(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  if (
    !req.user ||
    !roles.includes(req.user.role)
  ) {

    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });

  }

  next();
};
