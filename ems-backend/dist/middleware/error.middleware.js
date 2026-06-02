"use strict";
// src/middleware/error.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const app_error_1 = require("../core/errors/app-error");
const errorMiddleware = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    if (err instanceof app_error_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // TypeORM / DB errors
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry — record already exists';
    }
    // class-validator errors (thrown as array)
    if (Array.isArray(err.errors)) {
        statusCode = 422;
        message = 'Validation failed';
        res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            errors: err.errors,
        });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }
    // Log in development only
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${err.stack}`);
    }
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
};
exports.errorMiddleware = errorMiddleware;
