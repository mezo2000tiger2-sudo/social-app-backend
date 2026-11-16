import type { Request, Response } from "express";

export const GlobalSuccessResponse = (req: Request, res: Response) => {
  return res.status(res.locals.statusCode ?? 200).send({
    success: true,
    message: res.locals.message ?? "Success",
    data: res.locals.data,
  });
};