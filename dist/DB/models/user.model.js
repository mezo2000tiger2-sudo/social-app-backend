"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_js_1 = require("../../common/enum/user.enum.js");
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
        enum: [user_enum_js_1.GenderEnum.male, user_enum_js_1.GenderEnum.female],
        default: user_enum_js_1.GenderEnum.male,
        trim: true,
        required: [true, 'first name is required'],
    },
    role: {
        type: String,
        enum: [user_enum_js_1.roleEnum.user, user_enum_js_1.roleEnum.admin],
        default: user_enum_js_1.roleEnum.user,
        trim: true,
        required: [true, 'first name is required'],
    },
    age: {
        type: Number,
        required: [true, 'age is required'],
        min: [18, 'age must be at least 18'],
        max: [100, 'age must be at most 100'],
    },
    phone: Number,
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
userSchema.pre('save', function () {
    console.log('=========pre save======');
});
userSchema.post('save', function () {
    console.log('=========post save======');
});
userSchema.virtual('fullName')
    .get(function () {
    return this.fName + ' ' + this.lName;
})
    .set(function (value) {
    const [fName = '', lName = ''] = value.trim().split(/\s+/);
    this.fName = fName;
    this.lName = lName;
});
const userModel = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
exports.default = userModel;
//# sourceMappingURL=user.model.js.map