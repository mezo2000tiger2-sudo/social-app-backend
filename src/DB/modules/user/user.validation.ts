import * as z from "zod";
import { GenderEnum } from "../../../common/enum/user.enum.js";

export const signUpSchema= {
    body:z.strictObject({
    fName:z.string().min(3,'first name must be at least 3 characters').max(20,'first name must be at most 20 characters'),
    lName:z.string().min(3,'last name must be at least 3 characters').max(20,'last name must be at most 20 characters'),
    email:z.string().email('invalid email address'),
    password:z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'password must be at least 8 characters long and contain at least one letter and one number'),
    gender:z.enum([GenderEnum.male,GenderEnum.female],'gender must be either male or female').optional(),
    phone:z.number().optional(),
    age:z.number().min(18,'age must be at least 18').max(100,'age must be at most 100'),
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
}

export const signInSchema = { body: z.strictObject({
  email: z.string().email(),
  password: z.string().min(1),
})};

export const confirmEmailSchema = { body: z.strictObject({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, 'otp must be 6 digits'),
})};
export const resendOtpSchema = { body: z.strictObject({
  email: z.string().email(),
})};