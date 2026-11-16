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
import jwt from "jsonwebtoken";
import { SendEmailOtp } from "./auth.helper.js";

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
        res.locals.data = { access_token, refresh_token };
        res.locals.message = "signed in successfully";
        res.locals.statusCode = 201;
        next();
    };

    confrimEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;
        const normalizedEmail = String(email).trim().toLowerCase();

        const otpValue = await RedisService.getValue({
            key: `otp::${normalizedEmail}`,
        });

        if (!otpValue) {
            throw new AppError("otp expired", 400);
        }
        if (!Compare(otp, otpValue)) {
            throw new AppError("otp invalid", 400);
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: { email: normalizedEmail, isConfirmed: { $ne: true } },
            update: { isConfirmed: true },
        });
        if (user) {
            RedisService.deleteKey(`otp::${email}`);
            RedisService.deleteKey(`otp::max::${email}`);
            RedisService.deleteKey(`otp::block::${email}`);
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

    logout = async(req: Request, res: Response, next: NextFunction) => {
        const { flag } = req.query;
        const user = req.user;
        const payload =req.payload;
        if(!user){
            throw new AppError('error finding user')
        }
        if(!payload){
            throw new AppError('error finding payload')
        }
        if (flag && flag === "all") {
            user.changeCredentialsAt = new Date();
            const updatedUser = await this._userRepo.findByIdAndUpdate({
                id: user._id,
                update: { changeCredentialsAt: user.changeCredentialsAt },
            });

            const revokeKeys = await RedisService.keys(`revoke_token::${user._id}`);
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
        next()
    };

    forgetPassword = async(req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        await SendEmailOtp({
            email,
            isConfirmed: true,
            subject: "forget password",
        });

        next()
    };

    resetPassword = async(req: Request, res: Response, next: NextFunction) => {
        const { email, otp, password } = req.body;
        const otpValue = await RedisService.getValue({ key: `otp::${email}` });
        if (!otpValue) throw new Error(`token expire`);
        if (!Compare(otp, otpValue)) {
            throw new Error("otp invalid", { cause: 400 });
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: {
                email,
                isConfirmed: { $exists: true },
            },
            update: {
                password: Hash(password),
                changeCredentialsAt: new Date(),
            },
        });
        if (!user) throw new Error("user not exist or not confirmed");
        await RedisService.deleteKey(`otp::${email}`);
        next()
    };
}

export default new AuthService();
