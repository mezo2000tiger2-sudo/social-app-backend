import { NextFunction, Request, Response } from "express";
import { IUser } from "../../models/user.model.js";
import { UserRepository } from "../../repositories/user.repository.js";

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
}

export default new AuthService();
