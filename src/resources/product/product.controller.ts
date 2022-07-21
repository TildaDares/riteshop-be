import {
  Router, Request, Response, NextFunction
} from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HTTPException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/product/product.validation';
import ProductService from '@/resources/product/product.service';

class ProductController implements Controller {
  public path = '/products';

  public router = Router();

  private ProductService = new ProductService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, validationMiddleware(validate.create), this.create);
  }

  private create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const product = await this.ProductService.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }
}

export default ProductController;
