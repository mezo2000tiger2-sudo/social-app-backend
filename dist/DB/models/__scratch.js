"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (GenderEnum = {}));
var roleEnum;
(function (roleEnum) {
    roleEnum["user"] = "user";
    roleEnum["admin"] = "admin";
})(roleEnum || (roleEnum = {}));
const userSchema = new mongoose_1.default.Schema({
    fName: {
        type: String,
        trim: true,
        required: [true, 'first name is required'],
        minLength: [3, 'first name must be at least 3 characters'],
        maxLength: [20, 'first name must be at most 20 characters'],
    },
    lName: {
        type: String,
        trim: true,
        required: [true, 'first name is required'],
        minLength: [3, 'first name must be at least 3 characters'],
        maxLength: [20, 'first name must be at most 20 characters'],
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'first name is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: 'please enter a valid email'
        }
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'first name is required'],
    },
    gender: {
        type: String,
        enum: [GenderEnum.male, GenderEnum.female],
        default: GenderEnum.male,
        trim: true,
        required: [true, 'first name is required'],
    },
    role: {
        type: String,
        enum: [roleEnum.user, roleEnum.admin],
        default: roleEnum.user,
        trim: true,
        required: [true, 'first name is required'],
    },
    phone: String,
    profileImage: String,
    isConfirmed: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    strict: 'throw',
    strictQuery: 'throw',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.virtual('fullName')
    .get(function () {
    return this.fName + ' ' + this.lName;
})
    .set(function (v) {
    const [fName, lName] = v.split(' ');
    this.fName = fName;
    this.lName = lName;
});
const userModel = mongoose_1.default.models.mongoose.model('User', userSchema);
//# sourceMappingURL=__scratch.js.map