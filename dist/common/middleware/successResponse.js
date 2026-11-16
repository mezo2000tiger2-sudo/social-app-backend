"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalSuccessResponse = void 0;
const GlobalSuccessResponse = (req, res) => {
    return res.status(res.locals.statusCode ?? 200).send({
        success: true,
        message: res.locals.message ?? "Success",
        data: res.locals.data,
    });
};
exports.GlobalSuccessResponse = GlobalSuccessResponse;
//# sourceMappingURL=successResponse.js.map