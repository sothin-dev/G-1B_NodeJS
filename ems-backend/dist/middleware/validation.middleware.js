"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validateBody = (Dto) => async (req, res, next) => {
    const dto = (0, class_transformer_1.plainToInstance)(Dto, req.body);
    const errors = await (0, class_validator_1.validate)(dto, {
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
                constraints: error.constraints,
            })),
        });
    }
    req.body = dto;
    return next();
};
exports.validateBody = validateBody;
