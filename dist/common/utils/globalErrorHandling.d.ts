export declare class AppError extends Error {
    StatusCode?: number | undefined;
    details?: unknown;
    constructor(message: string, StatusCode?: number | undefined, details?: unknown);
}
import { type NextFunction, type Request, type Response } from "express";
export declare const GlobalErrorHandling: (err: AppError, req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=globalErrorHandling.d.ts.map