import {
  Router, Request, Response, NextFunction
} from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HTTPException from '@/utils/exceptions/http.exception';
import RequestRoleService from '@/resources/request-role/requestRole.service';
import authenticated from "@/middleware/authenticated.middleware";
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/request-role/requestRole.validation';
import isAdmin from "@/middleware/authorized.middleware";
import User from '@/resources/user/user.interface';
import RequestRole from '@/resources/request-role/requestRole.interface';
import isAuthorized from '@/utils/helpers/authorization';

class RoleController implements Controller {
  public path = '/request-role';

  public router = Router();

  private RequestRoleService = new RequestRoleService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}/`, authenticated, validationMiddleware(validate.create), this.create);
    this.router.put(`${this.path}/:id`, authenticated, isAdmin, validationMiddleware(validate.update), this.update);
    this.router.get(`${this.path}/`, authenticated, isAdmin, this.getAll);
    this.router.get(`${this.path}/requests/`, authenticated, this.getRequests);
    this.router.get(`${this.path}/requests/:requester`, authenticated, this.getByRequester);
    this.router.get(`${this.path}/:id`, authenticated, isAdmin, this.getById);
  }

  private create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      const roleRequest = {
        requester: user._id,
        requestedRole: req.body.requestedRole,
      } as RequestRole;
      const request = await this.RequestRoleService.create(roleRequest);
      res.status(201).json({ request })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      const roleRequest = {
        reviewer: user?._id,
        status: req.body.status,
      } as RequestRole;
      const request = await this.RequestRoleService.update(req.params.id, roleRequest);
      res.status(200).json({ request })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const requests = await this.RequestRoleService.getAll();
      res.status(200).json({ requests })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private getRequests = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      const id = user._id?.toString() as string
      const requests = await this.RequestRoleService.getByRequester(id);
      res.status(200).json({ requests })
    } catch (error) {

      next(new HTTPException(404, error.message));
    }
  }

  private getByRequester = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      if (!isAuthorized(user, req.params.requester)) {
        return next(new HTTPException(401, "You don't have enough permissions to perform this action"));
      }
      const requests = await this.RequestRoleService.getByRequester(req.params.requester);
      res.status(200).json({ requests })
    } catch (error) {

      next(new HTTPException(404, error.message));
    }
  }

  private getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const request = await this.RequestRoleService.getById(req.params.id);
      res.status(200).json({ request })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }
}

export default RoleController;
