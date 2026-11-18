import { NextFunction, Request, Response } from "express";
import { IUser } from "../../models/user.model.js";
import { AppError } from "../../../common/utils/globalErrorHandling.js";
import { UserRepository } from "../../repositories/user.repository.js";
import RedisService from "../../connectRedis.js";
import { Compare, Hash } from "../../../common/security/hash.js";
import { generat_otp, sendEmail } from "../../../common/utils/sendEmail.js";
import { emailTemplate } from "../../../common/utils/email.template.js";
import { eventEmitter } from "../../../common/utils/events.js";
import { providorEnum } from "../../../common/enum/user.enum.js";
import { randomUUID } from "node:crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { CLIENT_ID } from "../../../config/config.service.js";
import { SendEmailOtp } from "./auth.helper.js";

const googleClient = new OAuth2Client(CLIENT_ID);

class AuthService {
    private readonly _userRepo = new UserRepository();

    siginUp = async (req: Request, res: Response, next: NextFunction) => {
        const { age, email, fName, lName, password, gender, phone }: IUser =
            req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const emailExist = await this._userRepo.findOne({
            filter: { email: normalizedEmail },
        });
        if (emailExist) {
            throw new AppError("Email already exist", 400);
        }

        const [user] = await this._userRepo.create({
            age,
            email: normalizedEmail,
            fName,
            lName,
            password: Hash(password),
            gender,
            phone,
        });
        if (!user) {
            throw new AppError("User creation failed", 500);
        }

        const otp = generat_otp();
        const otpHash = Hash(otp);

        await RedisService.setValue({
            key: `otp::${normalizedEmail}`,
            value: otpHash,
            ttl: 60 * 2,
        });

        eventEmitter.emit("Confirm_email", async () => {
            await sendEmail({
                subject: "email confirm",
                to: normalizedEmail,
                html: emailTemplate(Number(otp)),
            });
        });

        const { password: _password, ...safeUser } = user.toObject();

        res.locals.data = safeUser;
        res.locals.message = "user created successfully";
        res.locals.statusCode = 201;
        next();
    };

    signIn = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        const user = await this._userRepo.findOne({
            filter: {
                email: email.toLowerCase(),
                isConfirmed: { $exists: true },
            },
        });

        if (!user) {
            throw new AppError("email not exist", 401);
        }
        if (user.providor !== providorEnum.system) {
            throw new AppError(
                `login with your original provider = ${user.providor}`,
                400,
            );
        }
        if (!Compare(password, user.password)) {
            throw new AppError("inValid password", 401);
        }

        const tokenId = randomUUID();
        const access_token = jwt.sign({ userId: user._id }, "y-access", {
            expiresIn: 60 * 5,
            jwtid: tokenId,
            // notBefore:60,
            // noTimestamp:true
        });
        const refresh_token = jwt.sign({ userId: user._id }, "y-refresh", {
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

    confrimEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedOtp = String(otp).trim();

        const otpValue = await RedisService.getValue({
            key: `otp::${normalizedEmail}`,
        });

        if (!otpValue) {
            throw new AppError("otp expired", 400);
        }
        if (!Compare(normalizedOtp, otpValue)) {
            throw new AppError("otp invalid", 400);
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: { email: normalizedEmail, isConfirmed: { $ne: true } },
            update: { isConfirmed: true },
        });
        if (user) {
            RedisService.deleteKey(`otp::${normalizedEmail}`);
            RedisService.deleteKey(`otp::max::${normalizedEmail}`);
            RedisService.deleteKey(`otp::block::${normalizedEmail}`);
        }

        if (!user) {
            throw new AppError("user not exist", 400);
        }
        next();
    };

    resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();
        await SendEmailOtp({
            email: normalizedEmail,
            isConfirmed: false,
            subject: "confirm email",
        });

        next();
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        const { flag } = req.query;
        const user = req.user;
        const payload = req.payload;
        if (!user) {
            throw new AppError("error finding user");
        }
        if (!payload) {
            throw new AppError("error finding payload");
        }
        if (flag && flag === "all") {
            user.changeCredentialsAt = new Date();
            const updatedUser = await this._userRepo.findByIdAndUpdate({
                id: user._id,
                update: { changeCredentialsAt: user.changeCredentialsAt },
            });

            const revokeKeys = await RedisService.keys(
                `revoke_token::${user._id}`,
            );
            for (const key of revokeKeys) {
                await RedisService.deleteKey(key);
            }
        } else {
            if (payload.exp === undefined) {
                throw new AppError("error finding token expiration");
            }
            await RedisService.setValue({
                key: `revoke_token::${user._id}::${payload.jti}`,
                value: `${payload.jti}`,
                ttl: payload.exp - Math.floor(Date.now() / 1000),
            });
        }
        res.locals.statusCode = 201;
        next();
    };

    forgetPassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { email } = req.body;
        await SendEmailOtp({
            email,
            isConfirmed: true,
            subject: "forget password",
        });

        next();
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp, password } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedOtp = String(otp).trim();
        const otpValue = await RedisService.getValue({
            key: `otp::${normalizedEmail}`,
        });
        if (!otpValue) throw new Error(`token expire`);
        if (!Compare(normalizedOtp, otpValue)) {
            throw new Error("otp invalid", { cause: 400 });
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: {
                email: normalizedEmail,
                isConfirmed: { $exists: true },
            },
            update: {
                password: Hash(password),
                changeCredentialsAt: new Date(),
            },
        });
        if (!user) throw new Error("user not exist or not confirmed");
        await RedisService.deleteKey(`otp::${normalizedEmail}`);
        next();
    };

    signUpWithGmail = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { idToken } = req.body;

        const decoded = await googleClient.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });

        const { picture, given_name, family_name, email, email_verified } =
            decoded.getPayload()!;

        let user = await this._userRepo.findOne({
            filter: {
                email: email!.toLowerCase(),
            },
        });

        if (!user) {
            const [created] = await this._userRepo.create({
                fName: given_name!,
                lName: family_name!,
                email: email!,
                profileImage: picture!,
                isConfirmed: Boolean(email_verified),
                providor: providorEnum.google,
                password: Hash(randomUUID()),
            });
            if (!created) {
                throw new AppError("User creation failed", 500);
            }
            user = created;
        }

        if (user.providor !== providorEnum.google) {
            throw new AppError(
                `login with your original provider = ${user.providor}`,
                400,
            );
        }

        const tokenId = randomUUID();
        const access_token = jwt.sign({ userId: user._id }, "y-access", {
            expiresIn: 60 * 5,
            jwtid: tokenId,
        });
        const refresh_token = jwt.sign({ userId: user._id }, "y-refresh", {
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
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
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

        let payload: string | JwtPayload;
        try {
            payload = jwt.verify(token, "y-refresh");
        } catch {
            throw new AppError("invalid or expired refresh token", 401);
        }

        if (typeof payload === "string" || !payload.userId) {
            throw new AppError("invalid refresh token", 401);
        }

        const user = await this._userRepo.findOne({
            filter: {
                _id: payload.userId,
            },
        });
        if (!user) {
            throw new AppError("user not found with this refresh token", 404);
        }

        if ((user.changeCredentialsAt?.getTime() ?? 0) > (payload.iat ?? 0) * 1000) {
            throw new AppError("token has expired", 401);
        }

        const revokedTtl = await RedisService.getTTL({
            key: `revoke_token::${user._id}::${payload.jti}`,
        });
        if (revokedTtl > 0) {
            throw new AppError("invalid revoked token, login again", 401);
        }

        const access_token = jwt.sign({ userId: user._id }, "y-access", {
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

export default new AuthService();
