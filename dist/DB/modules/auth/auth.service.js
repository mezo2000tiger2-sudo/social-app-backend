"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globalErrorHandling_js_1 = require("../../../common/utils/globalErrorHandling.js");
const user_repository_js_1 = require("../../repositories/user.repository.js");
const connectRedis_js_1 = __importDefault(require("../../connectRedis.js"));
const hash_js_1 = require("../../../common/security/hash.js");
const sendEmail_js_1 = require("../../../common/utils/sendEmail.js");
const email_template_js_1 = require("../../../common/utils/email.template.js");
const events_js_1 = require("../../../common/utils/events.js");
class AuthService {
    _userRepo = new user_repository_js_1.UserRepository();
    siginUp = async (req, res, next) => {
        const { age, email, fName, lName, password, gender, phone } = req.body;
        // the schema lowercases on save, but queries are case-sensitive -> normalize here
        const normalizedEmail = email.trim().toLowerCase();
        const emailExist = await this._userRepo.findOne({ filter: { email: normalizedEmail } });
        if (emailExist) {
            throw new globalErrorHandling_js_1.AppError("Email already exist", 400);
        }
        // the password is hashed here because pre('save') no longer hashes it
        const [user] = await this._userRepo.create({
            age,
            email: normalizedEmail,
            fName,
            lName,
            password: (0, hash_js_1.Hash)(password),
            gender,
            phone,
        });
        if (!user) {
            throw new globalErrorHandling_js_1.AppError("User creation failed", 500);
        }
        const otp = (0, sendEmail_js_1.generat_otp)();
        const otpHash = (0, hash_js_1.Hash)(otp);
        await connectRedis_js_1.default.setValue({
            key: `otp::${normalizedEmail}`,
            value: otpHash,
            ttl: 60 * 2,
        });
        events_js_1.eventEmitter.emit("Confirm_email", async () => {
            await (0, sendEmail_js_1.sendEmail)({
                subject: "email confirm",
                to: normalizedEmail,
                html: (0, email_template_js_1.emailTemplate)(Number(otp)),
            });
        });
        const { password: _password, ...safeUser } = user.toObject();
        res.locals.data = safeUser;
        res.locals.message = "user created successfully";
        res.locals.statusCode = 201;
        next();
    };
}
exports.default = new AuthService();
// import { NextFunction, Request, Response } from "express"
// import userModel, { IUser } from "../../models/user.model.js"
// import { AppError } from "../../../common/utils/globalErrorHandling.js"
// import { UserRepository } from "../../repositories/user.repository.js"
// class AuthService{
//     private readonly _userRepo=new UserRepository()
//     constructor(){}
//     siginUp=async (req:Request,res:Response,next:NextFunction)=>{
//         const {age,email,fName,lName,password,gender,phone}:IUser=req.body
//         const emailExist=await this._userRepo.findOne({ filter: { email } })
//         if(emailExist){
//             throw new AppError("Email already exist",400)
//         }
//         const user =await this._userRepo.create({age,email,fName,lName,password,gender,phone})
//         res.locals.data = user
//         res.locals.message = "user created successfully"
//         res.locals.statusCode = 201
//         next()
//     }
// }
// export default new AuthService()
//# sourceMappingURL=auth.service.js.map