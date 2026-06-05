// src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../core/errors/app-error'

export const errorMiddleware = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500
  let message = 'Internal server error'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  }

  // TypeORM / DB errors
  if ((err as any).code === 'ER_DUP_ENTRY') {
    statusCode = 409
    message = 'Duplicate entry — record already exists'
  }

  // class-validator errors (thrown as array)
  if (Array.isArray((err as any).errors)) {
    statusCode = 422
    message = 'Validation failed'
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: (err as any).errors,
    })
    return
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token has expired'
  }

  // Log in development only
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${err.stack}`)
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
}