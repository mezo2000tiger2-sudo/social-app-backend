"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSuccessResponse = void 0;
const GlobalSuccessResponse = ({ res, data, message = "Success", statusCode = 200 }) => {
    return res.status(statusCode).send({
        success: true,
        message,
        data,
    });
};
exports.GlobalSuccessResponse = GlobalSuccessResponse;
//# sourceMappingURL=globalSuccessResponse.js.map