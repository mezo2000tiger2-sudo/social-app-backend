import { Router } from "express";
import US from "./user.service.js";
import { Validation } from "../../../common/middleware/validation.js";
import { GlobalSuccessResponse } from "../../../common/middleware/successResponse.js";
import { authentication } from "../../../common/middleware/authentecation.js";
import multerCloud from "../../../common/middleware/multer.cloud.js";
import { MulterEnum, StoreEnum } from "../../../common/enum/multer.enum.js";
import {
    searchUsersSchema,
    updatePasswordSchema,
    updateProfileSchema,
} from "./user.validation.js";

const userRoute = Router();

userRoute.get("/profile", authentication, US.getProfile, GlobalSuccessResponse);

userRoute.patch(
    "/profile",
    authentication,
    multerCloud({store_type:StoreEnum.disk}).single("profileImage"),
    Validation(updateProfileSchema),
    US.updateProfile,
    GlobalSuccessResponse,
);

userRoute.get("/search", authentication, Validation(searchUsersSchema), US.searchUsers, GlobalSuccessResponse);

userRoute.patch("/password", authentication, Validation(updatePasswordSchema), US.updatePassword, GlobalSuccessResponse);

export default userRoute;
