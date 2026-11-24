import jwt, { type JwtPayload } from "jsonwebtoken";
import RedisService from "../../DB/connectRedis.js";
import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository.js";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model.js";
import { AppError } from "../utils/globalErrorHandling.js";
const userRepo = new UserRepository();
interface AccessTokenPayload extends JwtPayload {
    userId: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: HydratedDocument<IUser>;
            payload?: AccessTokenPayload;
        }
    }
}
export async function authentication(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { authorization } = req.headers;

    if (!authorization) {
        throw new AppError("authorization is required", 401);
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
          throw new AppError("invalid authorization format",401)
    }

    let decoded: string | JwtPayload;
    try {
        decoded = jwt.verify(token, "y-access");
    } catch {
        throw new AppError("invalid or expired token", 401);
    }

    if (typeof decoded === "string") {
        return res.status(401).json({ message: "invalid token payload" });
    }

    const payload = decoded as AccessTokenPayload;
    const user = await userRepo.findOne({
        filter: {
            _id: payload.userId,
        },
    });
    if (!user) {
        throw new AppError("user not found", 404);
    }
    if (!user.isConfirmed) throw new AppError("you need to be confirmed", 403);

    if (
        (user.changeCredentialsAt?.getTime() ?? 0) >
        (payload.iat ?? 0) * 1000
    ) {
        throw new AppError("token has expired", 401);
    }
    const ttl = await RedisService.getTTL({
        key: `revoke_token::${user._id}::${payload.jti}`,
    });

    if (ttl > 0) {
        throw new AppError("invalid revoked token, login again", 401);
    }
    req.user = user;
    req.payload = payload;
    next();
}
