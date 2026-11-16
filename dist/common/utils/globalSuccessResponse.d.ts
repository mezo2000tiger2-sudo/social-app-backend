import type { Response } from "express";
export declare const GlobalSuccessResponse: ({ res, data, message, statusCode }: {
    res: Response;
    data?: unknown;
    message?: string;
    statusCode?: number;
}) => Response<any, Record<string, any>>;
//# sourceMappingURL=globalSuccessResponse.d.ts.map