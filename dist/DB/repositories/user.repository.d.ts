import { Model } from "mongoose";
import { DBRepository } from "./db.repository.js";
import { IUser } from "../models/user.model.js";
export declare class UserRepository extends DBRepository<IUser> {
    readonly model: Model<IUser>;
    constructor(model?: Model<IUser>);
}
//# sourceMappingURL=user.repository.d.ts.map