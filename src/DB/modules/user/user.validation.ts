import * as z from "zod";
import { GenderEnum } from "../../../common/enum/user.enum.js";



export const updateProfileSchema = {
  body: z
    .strictObject({
      fName: z.string().min(3, 'first name must be at least 3 characters').max(20, 'first name must be at most 20 characters'),
      lName: z.string().min(3, 'last name must be at least 3 characters').max(20, 'last name must be at most 20 characters'),
      age: z.number().min(18, 'age must be at least 18').max(100, 'age must be at most 100'),
      gender: z.enum([GenderEnum.male, GenderEnum.female], 'gender must be either male or female'),
      phone: z.number(),
    })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: 'at least one field is required',
    }),
};

export const updatePasswordSchema = {
  body: z.strictObject({
    oldpassword: z.string().min(1, 'old password is required'),
    newpassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'password must be at least 8 characters long and contain at least one letter and one number'),
  }),
};

export const searchUsersSchema = {
  query: z.strictObject({
    search: z.string().min(1, 'search must be at least 1 character').max(50, 'search must be at most 50 characters').optional(),
    page: z.coerce.number().int('page must be an integer').min(1, 'page must be at least 1').optional(),
    limit: z.coerce.number().int('limit must be an integer').min(1, 'limit must be at least 1').max(50, 'limit must be at most 50').optional(),
  }),
};