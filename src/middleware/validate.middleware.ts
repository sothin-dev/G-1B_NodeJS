import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

type ClassConstructor<T extends object> = {
  new (): T;
};

export const validateBody =
  <T extends object>(DtoClass: ClassConstructor<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "Validation failed",
        errors: errors.map((error) => ({
          field: error.property,
          messages: Object.values(error.constraints ?? {}),
        })),
      });
    }

    req.body = dto;
    return next();
  };
