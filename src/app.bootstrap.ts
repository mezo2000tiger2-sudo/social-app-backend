import { PORT } from "./config/config.service.js";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { AppError, GlobalErrorHandling } from "./common/utils/globalErrorHandling.js";
import authRoute from "./DB/modules/auth/auth.controller.js";
import userRoute from "./DB/modules/user/user.controller.js";
import { GlobalSuccessResponse } from "./common/middleware/successResponse.js";
import connectDb from "./DB/connectDB.js";
import RedisService from "./DB/connectRedis.js";


const port = PORT;
const app  = express();

const limiter = rateLimit({
    windowMs:60 *1000,
    limit:50,
    message:{
        success:false,
        error:'to many requests'
    },
})



const bootstrap = async () => {

    app.set('strict routing', true)
    await connectDb(port,app)
    await RedisService.Connect_Redis()

    app.use(limiter,helmet(),express.json())
    app.use(cors({
        origin:'*'
    }));

    app.use('/auth',authRoute)
    app.use('/users',userRoute)
    app.get('/upload/*path',(req:Request,res:Response,next:NextFunction)=>{
        const {path} =req.params as {path:string[]}
        const Key=path.join('/')
    })
    
    app.get('/',(req:Request,res:Response,next:NextFunction)=>{
        res.locals.message = 'welcome to my app'
        res.locals.statusCode = 200
        next()
    },GlobalSuccessResponse)
    app.use('{/*demo}', (req, res) => {
        throw new AppError(`the endpoint ${req.originalUrl} and the method ${req.method} are not found`,404)
    });

    app.use(GlobalErrorHandling)

}
export default bootstrap;