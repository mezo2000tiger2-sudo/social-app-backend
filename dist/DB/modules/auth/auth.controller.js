"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_js_1 = __importDefault(require("./auth.service.js"));
const validation_js_1 = require("../../../common/middleware/validation.js");
const successResponse_js_1 = require("../../../common/middleware/successResponse.js");
const auth_validation_js_1 = require("./auth.validation.js");
const authRoute = (0, express_1.Router)();
authRoute.post('/signup', (0, validation_js_1.Validation)(auth_validation_js_1.signUpSchema), auth_service_js_1.default.siginUp, successResponse_js_1.GlobalSuccessResponse);
exports.default = authRoute;
//# sourceMappingURL=auth.controller.js.map