import { NextFunction, Request, Response } from "express";
declare class AuthService {
    private readonly _userRepo;
    siginUp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map