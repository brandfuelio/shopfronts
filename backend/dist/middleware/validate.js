"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const validate = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : undefined,
            message: error.msg
        }));
        return next(new errorHandler_1.AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map