import { Router } from "express";
import US from "./user.service.js";
import { Validation } from "../../../common/middleware/validation.js";
import { GlobalSuccessResponse } from "../../../common/middleware/successResponse.js";
import { authentication } from "../../../common/middleware/authentecation.js";

const authRoute = Router();

// authRoute.post('/signup',Validation(signUpSchema),AS.siginUp,GlobalSuccessResponse)

export default authRoute;