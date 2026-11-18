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
                continue
            }
            // keep the parsed value so transforms (trim, ...) reach the handler.
            // only `body` is assigned because req.query/req.params are getters in Express 5
            if(key === 'body') req.body = validator.data
        }

        if(ResultError.length>0){
            return next(new AppError(JSON.stringify(ResultError),400))
        }

        next()
    }
}