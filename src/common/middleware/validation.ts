import type{ NextFunction, Request, Response } from "express"
import type{ZodType} from "zod"
import { AppError } from "../utils/globalErrorHandling.js"
type RequestType = keyof Request
type  SchemaType =Partial<Record<RequestType,ZodType>>

export const Validation =(schema:SchemaType)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const ResultError:unknown[] =[]

        for (const key of Object.keys(schema) as RequestType[]) {
            if(!schema[key]) continue
            const validator = schema[key].safeParse(req[key])
            if(!validator.success){
                ResultError.push(...validator.error.issues)
            }
        }

        if(ResultError.length>0){
            return next(new AppError(JSON.stringify(ResultError),400))
        }

        next()
    }
}