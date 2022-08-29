import { Router, Request, Response, NextFunction } from "express";
import Controller from "@/utils/interfaces/controller.interface";
import passport from "passport";
import { createToken } from "@/utils/token";
import User from "@/resources/user/user.interface";
import HTTPException from "@/utils/exceptions/http.exception";

class AuthController implements Controller {
  public path = "/auth";

  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      `${this.path}/google`,
      passport.authenticate("google", {
        session: false,
        scope: ["email", "profile"],
      })
    );

    this.router.get(
      `${this.path}/google/redirect`,
      passport.authenticate("google", {
        session: false,
        failureRedirect: '/api/login'
      }),
      (req: Request, res: Response, next: NextFunction) => {
        try {
          const token = createToken(req.user as User)
          res.cookie('authToken', token, { expires: new Date(Date.now() + (3600 * 1000 * 24)) });
          res.redirect('http://localhost:3000/')
        } catch (error) {
          next(new HTTPException(400, error.message));
        }
      }
    )
  }
}

export default AuthController;