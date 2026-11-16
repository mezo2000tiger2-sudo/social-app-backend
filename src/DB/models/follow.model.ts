import mongoose, { HydratedDocument } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandling.js";

export interface IFollow {
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
    createdAt?: Date;
}


const followSchema = new mongoose.Schema<IFollow>({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "follower is required"],
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "following is required"],
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    strict: "throw",
    strictQuery: "throw",
});


followSchema.pre("validate", function () {
    if (this.follower && this.following && this.follower.equals(this.following)) {
        throw new AppError("a user cannot follow himself", 400);
    }
});

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1, createdAt: -1 });
followSchema.index({ follower: 1, createdAt: -1 });

const followModel: mongoose.Model<IFollow> =
    mongoose.models.Follow || mongoose.model<IFollow>("Follow", followSchema);
export default followModel;
