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
//# sourceMappingURL=auth.validation.d.ts.map