import { Router, Request, Response, NextFunction } from "express";
import Controller from "@/utils/interfaces/controller.interface";
import HTTPException from "@/utils/exceptions/http.exception";
import validationMiddleware from "@/middleware/validation.middleware";
import validate from "@/resources/user/user.validation";
import UserService from "@/resources/user/user.service";
import User from "@/resources/user/user.interface";
import authenticated from "@/middleware/authenticated.middleware";
import { redisClient as client } from '@/config/redis';

class UserController implements Controller {
  public path = "/users";

  public router = Router();

  private UserService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(validate.register),
      this.register
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(validate.login),
      this.login
    );
    this.router.post(
      `${this.path}/logout`,
      authenticated,
      this.logout
    );
    this.router.get(`${this.path}`, authenticated, this.getUser);
    this.router.get(`${this.path}/:id`, authenticated, this.getUserById);
    this.router.put(`${this.path}/:id`, authenticated, validationMiddleware(validate.update), this.update);
    this.router.delete(`${this.path}/:id`, authenticated, this.delete);
  };

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { name, email, password} = req.body;
      const token = await this.UserService.register(
        name,
        email,
        password,
      );
      res.status(201).json({ token });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { email, password } = req.body;
      const token = await this.UserService.login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { token, tokenExp } = req;
      const token_key = `bl_${token}`;
      await client.set(token_key, token, {
        EXAT: tokenExp
      });
      res.status(200).send({ message: "Token invalidated" });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private getUser = (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return next(new HTTPException(400, 'No logged in user'))
    }

    res.status(200).json({ user: req.user });
  };

  private getUserById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!this.isAuthorized(req.user as User, req.params.id)) {
        return next(new HTTPException(401, "You don't have enough permissions to perform this action"));
      }
      const user = await this.UserService.getUserById(req.params.id);
      res.status(200).json({ user });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User;
      if (!this.isAuthorized(user, req.params.id)) {
        return next(new HTTPException(401, "You don't have enough permissions to perform this action"));
      }
      const updatedUser = await this.UserService.update(req.params.id, req.body);
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!this.isAuthorized(req.user as User, req.params.id)) {
        return next(new HTTPException(401, "You don't have enough permissions to perform this action"));
      }

      await this.UserService.delete(req.params.id);
      res.status(204).send({ message: "User deleted" });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private isAuthorized = (currentUser: User, userId: string): boolean => {
    const id = currentUser._id ? currentUser._id.toString() : '';
    return currentUser.role === 'admin' || id === userId;
  }
}

export default UserController;
