import {
  Request,
  Response,
  NextFunction
} from "express";
import { JwtPayload } from "jsonwebtoken";

import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: JwtPayload | any;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  try {

    const token =
      req.headers.authorization
      ?.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    req.user = decoded as any;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });

  }
};

export default authMiddleware;