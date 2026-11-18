import * as z from "zod";
import { GenderEnum } from "../../../common/enum/user.enum.js";

const emailField = z.string().trim().email("invalid email address");
const passwordField = z.string().regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    "password must be at least 8 characters long and contain at least one letter and one number",
);
const token = z.looseObject({
  authorization: z
    .string({ error: "authorization is required" })
    .min(1, "authorization is required")
    .regex(/^Bearer\s+\S+$/, "authorization must be in the format: Bearer <token>"),

  connection: z.string().optional(),
  "accept-encoding": z.string().optional(),
  accept: z.string().optional(),
  "user-agent": z.string().optional(),
  host: z.string().optional(),
  "content-length": z.string().optional(),
  "postman-token": z.string().optional(),
  "content-type": z.string().optional(),
});
const otpField = z.string().trim().regex(/^\d{6}$/, "otp must be 6 digits");

export const signUpSchema = {
    body: z.strictObject({
        fName: z.string().min(3, "first name must be at least 3 characters").max(20, "first name must be at most 20 characters"),
        lName: z.string().min(3, "last name must be at least 3 characters").max(20, "last name must be at most 20 characters"),
        email: emailField,
        password: passwordField,
        gender: z.enum([GenderEnum.male, GenderEnum.female], "gender must be either male or female").optional(),
        phone: z.number().optional(),
        age: z.number().min(18, "age must be at least 18").max(100, "age must be at most 100"),
    }),
};

export const signInSchema = {
    body: z.strictObject({
        email: emailField,
        password: z.string().min(1),
    }),
};

export const confirmEmailSchema = {
    body: z.strictObject({
        email: emailField,
        otp: otpField,
    }),
};

export const resendOtpSchema = {
    body: z.strictObject({
        email: emailField,
    }),
};
export const refreshToeknSchema = {
    headers: token
};

export const resetPasswordSchema = {
    body: z.strictObject({
        email: emailField,
        otp: otpField,
        password: passwordField,
    }),
};

export const logoutSchema = {
    query: z.strictObject({
        flag: z.literal("all").optional(),
    }),
};

export const signUpWithGmailSchema = {
    body: z.strictObject({
        idToken: z.string().min(1, "idToken is required"),
    }),
};
