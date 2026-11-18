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
const authentecation_js_1 = require("../../../common/middleware/authentecation.js");
const authRoute = (0, express_1.Router)();
authRoute.post('/signup', (0, validation_js_1.Validation)(auth_validation_js_1.signUpSchema), auth_service_js_1.default.siginUp, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/signup/gmail', (0, validation_js_1.Validation)(auth_validation_js_1.signUpWithGmailSchema), auth_service_js_1.default.signUpWithGmail, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/signin', (0, validation_js_1.Validation)(auth_validation_js_1.signInSchema), auth_service_js_1.default.signIn, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/refresh-token', (0, validation_js_1.Validation)(auth_validation_js_1.refreshToeknSchema), auth_service_js_1.default.refreshToken, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/confirm-email', (0, validation_js_1.Validation)(auth_validation_js_1.confirmEmailSchema), auth_service_js_1.default.confrimEmail, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/resend-otp', (0, validation_js_1.Validation)(auth_validation_js_1.resendOtpSchema), auth_service_js_1.default.resendOtp, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/logout', authentecation_js_1.authentication, (0, validation_js_1.Validation)(auth_validation_js_1.logoutSchema), auth_service_js_1.default.logout, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/forget-password', (0, validation_js_1.Validation)(auth_validation_js_1.resendOtpSchema), auth_service_js_1.default.forgetPassword, successResponse_js_1.GlobalSuccessResponse);
authRoute.post('/reset-password', (0, validation_js_1.Validation)(auth_validation_js_1.resetPasswordSchema), auth_service_js_1.default.resetPassword, successResponse_js_1.GlobalSuccessResponse);
exports.default = authRoute;
//# sourceMappingURL=auth.controller.js.map