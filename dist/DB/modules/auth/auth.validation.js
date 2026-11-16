"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = void 0;
const z = __importStar(require("zod"));
const user_enum_js_1 = require("../../../common/enum/user.enum.js");
exports.signUpSchema = {
    body: z.strictObject({
        fName: z.string().min(3, 'first name must be at least 3 characters').max(20, 'first name must be at most 20 characters'),
        lName: z.string().min(3, 'last name must be at least 3 characters').max(20, 'last name must be at most 20 characters'),
        email: z.string().email('invalid email address'),
        password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'password must be at least 8 characters long and contain at least one letter and one number'),
        gender: z.enum([user_enum_js_1.GenderEnum.male, user_enum_js_1.GenderEnum.female], 'gender must be either male or female').optional(),
        phone: z.number().optional(),
        age: z.number().min(18, 'age must be at least 18').max(100, 'age must be at most 100'),
    })
    // .superRefine((value ,ctx)=>{
    //     if(value.password !== value.classpassword){
    //         ctx.addIssue({
    //             code:'custom',
    //             message:'password and classpassword must be the same',
    //             origin: 'cpassword'
    //         })
    //     }
    // })
};
//# sourceMappingURL=auth.validation.js.map