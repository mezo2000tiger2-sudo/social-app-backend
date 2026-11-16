import { Model } from "mongoose";
import { DBRepository } from "./db.repository.js";
import followModel, { IFollow } from "../models/follow.model.js";

export class FollowRepository extends DBRepository<IFollow> {

    constructor(public readonly model: Model<IFollow> = followModel) {
        super(model);
    }

}
