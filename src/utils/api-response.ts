import { Response } from "express";
import { ApiResponse } from "../core/types/api-response";

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
) => {

  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500
) => {

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode
  });
};