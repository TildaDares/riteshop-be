import { Router, Request, Response, NextFunction } from "express";
import Controller from "@/utils/interfaces/controller.interface";
import passport from "passport";

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
        // successRedirect: '/api/users',
        failureRedirect: '/api/login'
      }),
      (req: Request, res: Response) => {
        res.json({ message: "success" });
      }
    )
  };
}

export default AuthController;