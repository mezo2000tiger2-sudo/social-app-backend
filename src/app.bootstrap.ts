import { PORT } from "./config/config.service.js";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import {
    AppError,
    GlobalErrorHandling,
} from "./common/utils/globalErrorHandling.js";
import authRoute from "./DB/modules/auth/auth.controller.js";
import userRoute from "./DB/modules/user/user.controller.js";
import { GlobalSuccessResponse } from "./common/middleware/successResponse.js";
import connectDb from "./DB/connectDB.js";
import RedisService from "./DB/connectRedis.js";
import S3Service from "./DB/services/s3.service.js";
import { pipeline } from "node:stream/promises";
import notificationService from "./DB/services/notification.service.js";

const port = PORT;
const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
    message: {
        success: false,
        error: "to many requests",
    },
});

const bootstrap = async () => {
    app.set("strict routing", true);
    await connectDb(port, app);
    await RedisService.Connect_Redis();

    app.use(limiter, helmet(), express.json());
    app.use(
        cors({
            origin: "*",
        }),
    );

    app.use("/auth", authRoute);
    app.use("/users", userRoute);

    app.post(
        "/send-notification",
        async(req: Request, res: Response, next: NextFunction) => {
            await notificationService.sendNotification({
                token: req.body.token,
                data: {
                    title: "hihihihih",
                    body: "hihihihih",
                },
            });
        },
    );
    app.get(
        "/upload/pre-signed/*path",
        async (req: Request, res: Response, next: NextFunction) => {
            const { download } = req.query;
            const { path } = req.params as { path: string[] };
            const Key = path.join("/");
            const url = await new S3Service().getPreSignedUrl({
                Key,
                download: download == "true",
            });

            res.locals.data = url;
            res.locals.statusCode = 200;
            next();
        },
        GlobalSuccessResponse,
    );
    app.get(
        "/upload",
        async (req: Request, res: Response, next: NextFunction) => {
            const { folderName } = req.query;
            if (typeof folderName !== "string") {
                throw new AppError(
                    "folderName query parameter is required",
                    400,
                );
            }
            const { Contents } = await new S3Service().getFiles(folderName);
            const data = Contents?.map((file) => {
                return { key: file.Key };
            });

            res.locals.data = data;
            res.locals.statusCode = 200;
            next();
        },
        GlobalSuccessResponse,
    );
    app.get(
        "/upload/*path",
        async (req: Request, res: Response, next: NextFunction) => {
            const { dowenload } = req.query;
            const { path } = req.params as { path: string[] };
            const Key = path.join("/");
            const result = await new S3Service().getFile(Key);
            const body = result.Body as NodeJS.ReadableStream;
            res.setHeader("Content-type", result.ContentType!);
            res.setHeader("cross-origin-resource-policy", "cross-origin");
            res.setHeader("content-disposition", "cross-origin");
            if (dowenload && dowenload == "true") {
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${path.pop}"`,
                );
            }

            pipeline(body, res);
        },
    );
    app.get(
        "/",
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.message = "welcome to my app";
            res.locals.statusCode = 200;
            next();
        },
        GlobalSuccessResponse,
    );
    app.use("{/*demo}", (req, res) => {
        throw new AppError(
            `the endpoint ${req.originalUrl} and the method ${req.method} are not found`,
            404,
        );
    });

    app.use(GlobalErrorHandling);
};
export default bootstrap;
