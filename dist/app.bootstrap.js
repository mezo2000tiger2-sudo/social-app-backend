"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_js_1 = require("./config/config.service.js");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const globalErrorHandling_js_1 = require("./common/utils/globalErrorHandling.js");
const auth_controller_js_1 = __importDefault(require("./DB/modules/auth/auth.controller.js"));
const user_controller_js_1 = __importDefault(require("./DB/modules/user/user.controller.js"));
const successResponse_js_1 = require("./common/middleware/successResponse.js");
const connectDB_js_1 = __importDefault(require("./DB/connectDB.js"));
const connectRedis_js_1 = __importDefault(require("./DB/connectRedis.js"));
const port = config_service_js_1.PORT;
const app = (0, express_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 50,
    message: {
        success: false,
        error: 'to many requests'
    },
});
const bootstrap = async () => {
    app.set('strict routing', true);
    await (0, connectDB_js_1.default)(port, app);
    await connectRedis_js_1.default.Connect_Redis();
    app.use(limiter, (0, helmet_1.default)(), express_1.default.json());
    app.use((0, cors_1.default)({
        origin: '*'
    }));
    app.use('/auth', auth_controller_js_1.default);
    app.use('/users', user_controller_js_1.default);
    app.get('/', (req, res, next) => {
        res.locals.message = 'welcome to my app';
        res.locals.statusCode = 200;
        next();
    }, successResponse_js_1.GlobalSuccessResponse);
    app.use('{/*demo}', (req, res) => {
        throw new globalErrorHandling_js_1.AppError(`the endpoint ${req.originalUrl} and the method ${req.method} are not found`, 404);
    });
    app.use(globalErrorHandling_js_1.GlobalErrorHandling);
};
exports.default = bootstrap;
//# sourceMappingURL=app.bootstrap.js.map