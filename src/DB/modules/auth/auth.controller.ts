import { Router } from "express";
import AS from "./auth.service.js";
import { Validation } from "../../../common/middleware/validation.js";
import { GlobalSuccessResponse } from "../../../common/middleware/successResponse.js";
import { confirmEmailSchema, resendOtpSchema, signInSchema, signUpSchema } from "./auth.validation.js";
import { authentication } from "../../../common/middleware/authentecation.js";

const authRoute = Router();

authRoute.post('/signup',Validation(signUpSchema),AS.siginUp,GlobalSuccessResponse)
authRoute.post('/signin',Validation(signInSchema),AS.signIn,GlobalSuccessResponse)
authRoute.post('/confirm-email',Validation(confirmEmailSchema),AS.confrimEmail,GlobalSuccessResponse)
authRoute.post('/resend-otp',Validation(resendOtpSchema),AS.resendOtp,GlobalSuccessResponse)
authRoute.post('/logout',authentication,Validation(resendOtpSchema),AS.logout,GlobalSuccessResponse)
authRoute.post('/forget-password',Validation(resendOtpSchema),AS.forgetPassword,GlobalSuccessResponse)
authRoute.post('/reset-password',Validation(resendOtpSchema),AS.resetPassword,GlobalSuccessResponse)

export default authRoute;