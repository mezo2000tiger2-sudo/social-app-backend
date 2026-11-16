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

class AuthService {
    private readonly _userRepo = new UserRepository();

    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        res.locals.data = user;
        res.locals.statusCode = 200;
        next();
    };
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        let updatedUser;
        const user = req.user!;
        const { fName, lName, age, gender, phone } = req.body;
        const updateQuery: Partial<IUser> = {};
        if (fName !== undefined) updateQuery.fName = fName;
        if (lName !== undefined) updateQuery.lName = lName;
        if (age !== undefined) updateQuery.age = age;
        if (gender !== undefined) updateQuery.gender = gender;
        if (phone !== undefined) updateQuery.phone = phone;

        updatedUser = await this._userRepo.findByIdAndUpdate({
            id: user._id,
            update: updateQuery,
        });

        if (!updatedUser) throw new Error("user not found", { cause: 404 });

        res.locals.data = updatedUser;
        res.locals.statusCode = 200;
    };
}

export default new AuthService();
