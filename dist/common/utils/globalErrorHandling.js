"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandling = exports.AppError = void 0;
class AppError extends Error {
    StatusCode;
    details;
    constructor(message, StatusCode, details) {
        super(message);
        this.StatusCode = StatusCode;
        this.details = details;
    }
}
exports.AppError = AppError;
const GlobalErrorHandling = async (err, req, res, next) => {
    const statusCode = err.StatusCode || 500;
    res.status(statusCode).send({
        success: false,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
        stack: err.stack
    });
};
exports.GlobalErrorHandling = GlobalErrorHandling;
//# sourceMappingURL=globalErrorHandling.js.map