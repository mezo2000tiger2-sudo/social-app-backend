import * as z from "zod";
import { GenderEnum } from "../../../common/enum/user.enum.js";
export declare const signUpSchema: {
    body: z.ZodObject<{
        fName: z.ZodString;
        lName: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        gender: z.ZodOptional<z.ZodEnum<{
            female: GenderEnum.female;
            male: GenderEnum.male;
        }>>;
        phone: z.ZodOptional<z.ZodNumber>;
        age: z.ZodNumber;
    }, z.core.$strict>;
};
export declare const signInSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strict>;
};
export declare const confirmEmailSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        otp: z.ZodString;
    }, z.core.$strict>;
};
export declare const resendOtpSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strict>;
};
export declare const refreshToeknSchema: {
    headers: z.ZodObject<{
        authorization: z.ZodString;
        connection: z.ZodOptional<z.ZodString>;
        "accept-encoding": z.ZodOptional<z.ZodString>;
        accept: z.ZodOptional<z.ZodString>;
        "user-agent": z.ZodOptional<z.ZodString>;
        host: z.ZodOptional<z.ZodString>;
        "content-length": z.ZodOptional<z.ZodString>;
        "postman-token": z.ZodOptional<z.ZodString>;
        "content-type": z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
};
export declare const resetPasswordSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        otp: z.ZodString;
        password: z.ZodString;
    }, z.core.$strict>;
};
export declare const logoutSchema: {
    query: z.ZodObject<{
        flag: z.ZodOptional<z.ZodLiteral<"all">>;
    }, z.core.$strict>;
};
export declare const signUpWithGmailSchema: {
    body: z.ZodObject<{
        idToken: z.ZodString;
    }, z.core.$strict>;
};
//# sourceMappingURL=auth.validation.d.ts.map