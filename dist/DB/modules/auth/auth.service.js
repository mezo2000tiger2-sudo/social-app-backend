"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globalErrorHandling_js_1 = require("../../../common/utils/globalErrorHandling.js");
const user_repository_js_1 = require("../../repositories/user.repository.js");
const connectRedis_js_1 = __importDefault(require("../../connectRedis.js"));
const hash_js_1 = require("../../../common/security/hash.js");
const sendEmail_js_1 = require("../../../common/utils/sendEmail.js");
const email_template_js_1 = require("../../../common/utils/email.template.js");
const events_js_1 = require("../../../common/utils/events.js");
const user_enum_js_1 = require("../../../common/enum/user.enum.js");
const node_crypto_1 = require("node:crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const config_service_js_1 = require("../../../config/config.service.js");
const auth_helper_js_1 = require("./auth.helper.js");
const googleClient = new google_auth_library_1.OAuth2Client(config_service_js_1.CLIENT_ID);
class AuthService {
    _userRepo = new user_repository_js_1.UserRepository();
    siginUp = async (req, res, next) => {
        const { age, email, fName, lName, password, gender, phone } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const emailExist = await this._userRepo.findOne({
            filter: { email: normalizedEmail },
        });
        if (emailExist) {
            throw new globalErrorHandling_js_1.AppError("Email already exist", 400);
        }
        const [user] = await this._userRepo.create({
            age,
            email: normalizedEmail,
            fName,
            lName,
            password: (0, hash_js_1.Hash)(password),
            gender,
            phone,
        });
        if (!user) {
            throw new globalErrorHandling_js_1.AppError("User creation failed", 500);
        }
        const otp = (0, sendEmail_js_1.generat_otp)();
        const otpHash = (0, hash_js_1.Hash)(otp);
        await connectRedis_js_1.default.setValue({
            key: `otp::${normalizedEmail}`,
            value: otpHash,
            ttl: 60 * 2,
        });
        events_js_1.eventEmitter.emit("Confirm_email", async () => {
            await (0, sendEmail_js_1.sendEmail)({
                subject: "email confirm",
                to: normalizedEmail,
                html: (0, email_template_js_1.emailTemplate)(Number(otp)),
            });
        });
        const { password: _password, ...safeUser } = user.toObject();
        res.locals.data = safeUser;
        res.locals.message = "user created successfully";
        res.locals.statusCode = 201;
        next();
    };
    signIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this._userRepo.findOne({
            filter: {
                email: email.toLowerCase(),
                isConfirmed: { $exists: true },
            },
        });
        if (!user) {
            throw new globalErrorHandling_js_1.AppError("email not exist", 401);
        }
        if (user.providor !== user_enum_js_1.providorEnum.system) {
            throw new globalErrorHandling_js_1.AppError(`login with your original provider = ${user.providor}`, 400);
        }
        if (!(0, hash_js_1.Compare)(password, user.password)) {
            throw new globalErrorHandling_js_1.AppError("inValid password", 401);
        }
        const tokenId = (0, node_crypto_1.randomUUID)();
        const access_token = jsonwebtoken_1.default.sign({ userId: user._id }, "y-access", {
            expiresIn: 60 * 5,
            jwtid: tokenId,
            // notBefore:60,
            // noTimestamp:true
        });
        const refresh_token = jsonwebtoken_1.default.sign({ userId: user._id }, "y-refresh", {
            expiresIn: "7d",
            jwtid: tokenId,
        });
        res.locals.data = {
            user: { name: `${user.fName} ${user.lName}`, email: user.email },
            token: { access_token, refresh_token },
        };
        res.locals.message = "signed in successfully";
        res.locals.statusCode = 201;
        next();
    };
    confrimEmail = async (req, res, next) => {
        const { email, otp } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedOtp = String(otp).trim();
        const otpValue = await connectRedis_js_1.default.getValue({
            key: `otp::${normalizedEmail}`,
        });
        if (!otpValue) {
            throw new globalErrorHandling_js_1.AppError("otp expired", 400);
        }
        if (!(0, hash_js_1.Compare)(normalizedOtp, otpValue)) {
            throw new globalErrorHandling_js_1.AppError("otp invalid", 400);
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: { email: normalizedEmail, isConfirmed: { $ne: true } },
            update: { isConfirmed: true },
        });
        if (user) {
            connectRedis_js_1.default.deleteKey(`otp::${normalizedEmail}`);
            connectRedis_js_1.default.deleteKey(`otp::max::${normalizedEmail}`);
            connectRedis_js_1.default.deleteKey(`otp::block::${normalizedEmail}`);
        }
        if (!user) {
            throw new globalErrorHandling_js_1.AppError("user not exist", 400);
        }
        next();
    };
    resendOtp = async (req, res, next) => {
        const { email } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();
        await (0, auth_helper_js_1.SendEmailOtp)({
            email: normalizedEmail,
            isConfirmed: false,
            subject: "confirm email",
        });
        next();
    };
    logout = async (req, res, next) => {
        const { flag } = req.query;
        const user = req.user;
        const payload = req.payload;
        if (!user) {
            throw new globalErrorHandling_js_1.AppError("error finding user");
        }
        if (!payload) {
            throw new globalErrorHandling_js_1.AppError("error finding payload");
        }
        if (flag && flag === "all") {
            user.changeCredentialsAt = new Date();
            const updatedUser = await this._userRepo.findByIdAndUpdate({
                id: user._id,
                update: { changeCredentialsAt: user.changeCredentialsAt },
            });
            const revokeKeys = await connectRedis_js_1.default.keys(`revoke_token::${user._id}`);
            for (const key of revokeKeys) {
                await connectRedis_js_1.default.deleteKey(key);
            }
        }
        else {
            if (payload.exp === undefined) {
                throw new globalErrorHandling_js_1.AppError("error finding token expiration");
            }
            await connectRedis_js_1.default.setValue({
                key: `revoke_token::${user._id}::${payload.jti}`,
                value: `${payload.jti}`,
                ttl: payload.exp - Math.floor(Date.now() / 1000),
            });
        }
        res.locals.statusCode = 201;
        next();
    };
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
        await (0, auth_helper_js_1.SendEmailOtp)({
            email,
            isConfirmed: true,
            subject: "forget password",
        });
        next();
    };
    resetPassword = async (req, res, next) => {
        const { email, otp, password } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedOtp = String(otp).trim();
        const otpValue = await connectRedis_js_1.default.getValue({
            key: `otp::${normalizedEmail}`,
        });
        if (!otpValue)
            throw new Error(`token expire`);
        if (!(0, hash_js_1.Compare)(normalizedOtp, otpValue)) {
            throw new Error("otp invalid", { cause: 400 });
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: {
                email: normalizedEmail,
                isConfirmed: { $exists: true },
            },
            update: {
                password: (0, hash_js_1.Hash)(password),
                changeCredentialsAt: new Date(),
            },
        });
        if (!user)
            throw new Error("user not exist or not confirmed");
        await connectRedis_js_1.default.deleteKey(`otp::${normalizedEmail}`);
        next();
    };
    signUpWithGmail = async (req, res, next) => {
        const { idToken } = req.body;
        const decoded = await googleClient.verifyIdToken({
            idToken,
            audience: config_service_js_1.CLIENT_ID,
        });
        const { picture, given_name, family_name, email, email_verified } = decoded.getPayload();
        let user = await this._userRepo.findOne({
            filter: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            const [created] = await this._userRepo.create({
                fName: given_name,
                lName: family_name,
                email: email,
                profileImage: picture,
                isConfirmed: Boolean(email_verified),
                providor: user_enum_js_1.providorEnum.google,
                password: (0, hash_js_1.Hash)((0, node_crypto_1.randomUUID)()),
            });
            if (!created) {
                throw new globalErrorHandling_js_1.AppError("User creation failed", 500);
            }
            user = created;
        }
        if (user.providor !== user_enum_js_1.providorEnum.google) {
            throw new globalErrorHandling_js_1.AppError(`login with your original provider = ${user.providor}`, 400);
        }
        const tokenId = (0, node_crypto_1.randomUUID)();
        const access_token = jsonwebtoken_1.default.sign({ userId: user._id }, "y-access", {
            expiresIn: 60 * 5,
            jwtid: tokenId,
        });
        const refresh_token = jsonwebtoken_1.default.sign({ userId: user._id }, "y-refresh", {
            expiresIn: "7d",
            jwtid: tokenId,
        });
        res.locals.data = {
            user: { name: `${user.fName} ${user.lName}`, email: user.email },
            token: { access_token, refresh_token },
        };
        res.locals.statusCode = 200;
        next();
    };
    refreshToken = async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            return res
                .status(401)
                .json({ message: "authorization is required" });
        }
        const [scheme, token] = authorization.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res
                .status(401)
                .json({ message: "invalid authorization format" });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, "y-refresh");
        }
        catch {
            throw new globalErrorHandling_js_1.AppError("invalid or expired refresh token", 401);
        }
        if (typeof payload === "string" || !payload.userId) {
            throw new globalErrorHandling_js_1.AppError("invalid refresh token", 401);
        }
        const user = await this._userRepo.findOne({
            filter: {
                _id: payload.userId,
            },
        });
        if (!user) {
            throw new globalErrorHandling_js_1.AppError("user not found with this refresh token", 404);
        }
        if ((user.changeCredentialsAt?.getTime() ?? 0) > (payload.iat ?? 0) * 1000) {
            throw new globalErrorHandling_js_1.AppError("token has expired", 401);
        }
        const revokedTtl = await connectRedis_js_1.default.getTTL({
            key: `revoke_token::${user._id}::${payload.jti}`,
        });
        if (revokedTtl > 0) {
            throw new globalErrorHandling_js_1.AppError("invalid revoked token, login again", 401);
        }
        const access_token = jsonwebtoken_1.default.sign({ userId: user._id }, "y-access", {
            expiresIn: 60 * 5,
            jwtid: payload.jti,
        });
        res.locals.data = {
            user: { name: `${user.fName} ${user.lName}`, email: user.email },
            token: { access_token },
        };
        res.locals.statusCode = 200;
        next();
    };
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map