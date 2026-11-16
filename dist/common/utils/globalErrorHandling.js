"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandling = exports.AppError = void 0;
class AppError extends Error {
    StatusCode;
    constructor(message, StatusCode) {
        super(message);
        this.StatusCode = StatusCode;
    }
}
exports.AppError = AppError;
const GlobalErrorHandling = async (err, req, res, next) => {
    const statusCode = err.StatusCode || 500;
    res.status(statusCode).send({
        success: false,
        message: err.message,
        stack: err.stack
    });
};
exports.GlobalErrorHandling = GlobalErrorHandling;
//# sourceMappingURL=globalErrorHandling.js.map