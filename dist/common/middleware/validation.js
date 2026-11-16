"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const globalErrorHandling_js_1 = require("../utils/globalErrorHandling.js");
const Validation = (schema) => {
    return (req, res, next) => {
        const ResultError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validator = schema[key].safeParse(req[key]);
            if (!validator.success) {
                ResultError.push(...validator.error.issues);
            }
        }
        if (ResultError.length > 0) {
            return next(new globalErrorHandling_js_1.AppError(JSON.stringify(ResultError), 400));
        }
        next();
    };
};
exports.Validation = Validation;
//# sourceMappingURL=validation.js.map