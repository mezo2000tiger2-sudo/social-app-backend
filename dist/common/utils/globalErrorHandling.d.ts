export declare class AppError extends Error {
    StatusCode?: number | undefined;
    constructor(message: string, StatusCode?: number | undefined);
}
import { type NextFunction, type Request, type Response } from "express";
export declare const GlobalErrorHandling: (err: AppError, req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=globalErrorHandling.d.ts.map