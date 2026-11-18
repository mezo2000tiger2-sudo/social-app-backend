import { NextFunction, Request, Response } from "express";
declare class AuthService {
    private readonly _userRepo;
    siginUp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    signIn: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    confrimEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resendOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    signUpWithGmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map