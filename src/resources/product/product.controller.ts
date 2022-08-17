import {
  Router, Request, Response, NextFunction
} from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HTTPException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/product/product.validation';
import ProductService from '@/resources/product/product.service';
import authenticated from "@/middleware/authenticated.middleware";
import isAdmin from "@/middleware/authorized.middleware";

class ProductController implements Controller {
  public path = '/products';

  public router = Router();

  private ProductService = new ProductService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/search/:name`, this.findProducts);
    this.router.get(`${this.path}/:id`, this.getProductById);
    this.router.put(`${this.path}/:id`, authenticated, isAdmin, validationMiddleware(validate.create), this.update);
    this.router.delete(`${this.path}/:id`, authenticated, isAdmin, this.delete);
    this.router.post(`${this.path}`, authenticated, isAdmin, validationMiddleware(validate.create), this.create);
    this.router.get(`${this.path}`, this.getAllProducts);
  }

  private getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const products = await this.ProductService.getAllProducts();
      res.status(200).json({ products })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private getProductById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const product = await this.ProductService.getProductById(req.params.id);
      res.status(200).json({ product })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private findProducts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const products = await this.ProductService.findProducts(req.params.name);
      res.status(200).json({ products })
    } catch (error) {
      next(new HTTPException(404, error.message));
    }
  }

  private create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const product = await this.ProductService.create(req.body);
      res.status(201).json({ product });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const product = await this.ProductService.update(req.params.id, req.body);
      res.status(200).json({ product });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }

  private delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this.ProductService.delete(req.params.id);
      res.status(204).send({ message: "Product deleted" });
    } catch (error) {
      next(new HTTPException(400, error.message));
    }
  }
}

export default ProductController;
