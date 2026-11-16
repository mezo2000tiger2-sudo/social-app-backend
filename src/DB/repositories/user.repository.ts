import { Model} from "mongoose";
import { DBRepository } from "./db.repository.js";
import userModel, { IUser } from "../models/user.model.js";

export class UserRepository extends DBRepository<IUser> {

    constructor(public readonly model:Model<IUser>=userModel) {
        super(model);
    }

}
