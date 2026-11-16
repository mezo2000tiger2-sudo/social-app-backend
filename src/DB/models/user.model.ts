import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, providorEnum, roleEnum } from "../../common/enum/user.enum.js";
import { AppError } from "../../common/utils/globalErrorHandling.js";
import { Hash } from "../../common/security/hash.js";

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
    providor:providorEnum,
    isDeleted?:Boolean,
    changeCredentialsAt?:Date

}

const userSchema = new mongoose.Schema<IUser>({
    fName:{
        type:String,
        trim:true,
        required:[true,'first name is required'],
        minLength:[3,'first name must be at least 3 characters'],
        maxLength:[20,'first name must be at most 20 characters'],
    },
    lName:{
        type:String,
        trim:true,
        required:[true,'first name is required'],
        minLength:[3,'first name must be at least 3 characters'],
        maxLength:[20,'first name must be at most 20 characters'],
    },
    email:{
        type:String,
        trim:true,
        required:[true,'first name is required'],
        unique:true,
        lowercase:true,
        validate:{
            validator:function(value:string){
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
            },
            message:'please enter a valid email'
        }
    },
    password:{
        type:String,
        trim:true,
        required:[true,'first name is required'],
    },
    gender:{
        type:String,
        enum:[GenderEnum.male,GenderEnum.female],
        default:GenderEnum.male,
        trim:true,
        required:[true,'first name is required'],
    },
    role:{
        type:String,
        enum:[roleEnum.user,roleEnum.admin],
        default:roleEnum.user,
        trim:true,
        required:[true,'first name is required'],
    },
    age:{
        type:Number,
        required:[true,'age is required'],
        min:[18,'age must be at least 18'],
        max:[100,'age must be at most 100'],
    },
    phone:Number,
    profileImage:String,
    isConfirmed:Boolean,
    changeCredentialsAt:Date,
    isDeleted:Boolean,
    providor:{
        type:String,
        default:providorEnum.system,
    }
},{
    timestamps:true,
    strict:'throw',
    strictQuery:'throw',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

userSchema.pre('save', function () {
    console.log('=========pre save======')
})
userSchema.post('save', function () {
    console.log('=========post save======')
})

userSchema.virtual('fullName')
    .get(function () {
        return this.fName + ' ' + this.lName;
    })
    .set(function (value: string) {
        const [fName = '', lName = ''] = value.trim().split(/\s+/);
        this.fName = fName;
        this.lName = lName;
});

const userModel: mongoose.Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default userModel;