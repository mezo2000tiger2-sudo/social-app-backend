export class AppError extends Error{
    constructor(
        message:string,
        public StatusCode?:number,
        public details?: unknown,
    ){
        super(message)
    }
}

import express, { type NextFunction, type Request, type Response } from "express";

export const GlobalErrorHandling =async(err: AppError, req: Request, res: Response, next: NextFunction) => {
        const statusCode:number = (err.StatusCode as number) || 500;
        res.status(statusCode).send({
            success:false,
            message:err.message,
            ...(err.details !== undefined ? { details: err.details } : {}),
            stack:err.stack
        });
    }