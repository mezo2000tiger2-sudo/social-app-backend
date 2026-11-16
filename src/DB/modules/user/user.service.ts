import { NextFunction, Request, Response } from "express";
import { IUser } from "../../models/user.model.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { Compare, Hash } from "../../../common/security/hash.js";
import { AppError } from "../../../common/utils/globalErrorHandling.js";

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

        if (!updatedUser) throw new AppError("user not found", 404);

        res.locals.data = updatedUser;
        res.locals.statusCode = 200;
    };

    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search ?? "").replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );

        const users = await this._userRepo.find({
            filter: {
                $or: [
                    { fName: new RegExp(search, "i") },
                    { lName: new RegExp(search, "i") },
                ],
            },
            options: {
                select: "-password",
                skip: (page - 1) * limit,
                limit,
            },
        });

        res.locals.data = users;
        res.locals.statusCode = 200;
    };

    updatePassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { oldpassword, newpassword } = req.body;
        const user = req.user!;
        if (!Compare(oldpassword, user.password)) {
            throw new AppError("inValid old password", 401)
        }
        user.password = Hash(newpassword);
        user.changeCredentialsAt = new Date();
        const updatedUser = await this._userRepo.findByIdAndUpdate({
            id: user._id,
            update: {
                password: user.password,
                changeCredentialsAt: user.changeCredentialsAt,
            },
            
        });

        res.locals.data = updatedUser;
        res.locals.statusCode = 201;
        next();
    };
}

export default new AuthService();
