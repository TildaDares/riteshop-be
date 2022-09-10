import {
  Router, Request, Response, NextFunction
} from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HTTPException from '@/utils/exceptions/http.exception';
import OrderService from '@/resources/order/order.service';
import authenticated from "@/middleware/authenticated.middleware";
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/order/order.validation';
import isAdmin from "@/middleware/authorized.middleware";
import User from '@/resources/user/user.interface';
import isAuthorized from '@/utils/helpers/authorization';

class OrderController implements Controller {
  public path = '/orders';

  public router = Router();

  private OrderService = new OrderService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/all`, authenticated, isAdmin, this.getAll);
    this.router.get(`${this.path}/:id`, authenticated, this.getOrderById);
    this.router.put(`${this.path}/:id`, authenticated, validationMiddleware(validate.update), this.updateOrder);
    this.router.get(`${this.path}/user/:userId`, authenticated, this.getOrdersByUser);
    this.router.post(`${this.path}/`, authenticated, validationMiddleware(validate.create), this.createOrder);
    this.router.post(`${this.path}/create-paypal-transaction`, authenticated, this.createPaypalTransaction);
    this.router.post(`${this.path}/capture-payment/:orderId`, authenticated, this.capturePayment);
  }

  private getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const orders = await this.OrderService.getAll();
      res.status(200).json({ orders })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      const order = await this.OrderService.getOrderById(req.params.id, user);
      res.status(200).json({ order })
    } catch (error) {
      if (error instanceof HTTPException) {
        next(error)
      }
      next(new HTTPException(404, error.message));
    }
  }

  private getOrdersByUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      if (!isAuthorized(user, req.params.userId)) {
        return next(new HTTPException(401, "You don't have enough permissions to perform this action"));
      }
      const orders = await this.OrderService.getOrdersByUser(req.params.userId as string);
      res.status(200).json({ orders })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private createPaypalTransaction = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const order = await this.OrderService.createPaypalTransaction(req.body.total);
      res.status(201).json({ order })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private createOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      const order = await this.OrderService.createOrder(user._id?.toString() as string, req.body.shippingAddress, req.body.shippingFee);
      res.status(201).json({ order })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User
      const order = await this.OrderService.updateOrder(req.params.id, req.body, user);
      res.status(200).json({ order })
    } catch (error) {
      if (error instanceof HTTPException) {
        next(error)
      }
      next(new HTTPException(404, error.message));
    }
  }

  private capturePayment = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const payment = await this.OrderService.capturePayment(req.body.paypalOrderId, req.params.orderId);
      res.status(200).json({ payment })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }
}

export default OrderController;
