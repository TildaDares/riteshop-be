import {
  Router, Request, Response, NextFunction
} from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HTTPException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/cart/cart.validation';
import CartService from '@/resources/cart/cart.service';
import authenticated from "@/middleware/authenticated.middleware";
import User from '@/resources/user/user.interface';

class CartController implements Controller {
  public path = '/cart';

  public router = Router();

  private CartService = new CartService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}`, authenticated, this.getCartByUser);
    this.router.post(`${this.path}/`, authenticated, validationMiddleware(validate.create), this.addToCart);
    this.router.put(`${this.path}/`, authenticated, validationMiddleware(validate.create), this.updateCartProduct);
    this.router.delete(`${this.path}/`, authenticated, this.removeFromCart);
    this.router.delete(`${this.path}/empty`, authenticated, this.emptyCart);
  }

  private getCartByUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User;
      if (!user?._id) {
        return next(new HTTPException(400, 'User not found'));
      }
      const cart = await this.CartService.getCartByUser(user._id.toString());
      return res.status(200).json({ cart });
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private addToCart = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User;
      if (!user?._id) {
        return next(new HTTPException(400, 'User not found'));
      }
      const cart = await this.CartService.addToCart(req.body.item, user._id.toString());
      return res.status(201).json({ cart });
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private updateCartProduct = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User;
      if (!user?._id) {
        return next(new HTTPException(400, 'User not found'));
      }
      const cart = await this.CartService.updateCartProduct(req.body.item, user._id.toString());
      return res.status(200).json({ cart });
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User;
      if (!user?._id) {
        return next(new HTTPException(400, 'User not found'));
      }
      const cart = await this.CartService.removeFromCart(req.body.productId, user._id.toString());
      return res.status(200).json({ cart });
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private emptyCart = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const user = req.user as User;
      if (!user?._id) {
        return next(new HTTPException(400, 'User not found'));
      }
      const cart = await this.CartService.emptyCart(user._id.toString());
      return res.status(200).json({ cart });
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }
}

export default CartController;
