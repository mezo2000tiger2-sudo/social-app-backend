import mongoose from "mongoose";
import { GenderEnum, roleEnum } from "../../common/enum/user.enum.js";
export interface IUser {
    fName: string;
    lName: string;
    email: string;
    password: string;
    profileImage: string;
    gender?: GenderEnum | undefined;
    role?: roleEnum | undefined;
    isConfirmed: Boolean;
    phone?: number | undefined;
    age: number;
}
declare const userModel: mongoose.Model<IUser>;
export default userModel;
//# sourceMappingURL=user.model.d.ts.map