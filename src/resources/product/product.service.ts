import  ProductModel from '@/resources/product/product.model';
import Product from '@/resources/product/product.interface';

class ProductService {
  private product = ProductModel;

  /**
   * Create a new post
   * @param product
   * @returns
   */

  public async create(product: Product): Promise<Product> {
    try {
      const newProduct = this.product.create(product);
      return newProduct;
    } catch (error) {
      throw new Error("Unable to create product");
    }
  }
}

export default ProductService;
