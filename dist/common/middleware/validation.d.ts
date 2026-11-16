import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
type RequestType = keyof Request;
type SchemaType = Partial<Record<RequestType, ZodType>>;
export declare const Validation: (schema: SchemaType) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validation.d.ts.map