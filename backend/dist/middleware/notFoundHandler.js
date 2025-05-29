"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const errorHandler_1 = require("./errorHandler");
const notFoundHandler = (req, _res, next) => {
    const error = new errorHandler_1.AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFoundHandler.js.map