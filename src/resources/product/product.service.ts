import ProductModel from "@/resources/product/product.model";
import Product from "@/resources/product/product.interface";
import APIFunctions from "@/utils/APIFunctions";
import { ParsedQs } from "qs";

class ProductService {
  private product = ProductModel;

  public async getAllProducts(query: ParsedQs) {
    try {
      const specialFunctions = new APIFunctions(this.product.find(), query, this.product)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const products = await specialFunctions.query
      const total = await specialFunctions.count();
      return { products, total, count: products.length };
    } catch (error) {
      throw new Error("Unable to get products");
    }
  }

  public async getProductById(id: string) {
    try {
      const product = await this.product.findById(id).exec();
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      throw new Error("Unable to get product");
    }
  }

  public async create(product: Product): Promise<Product> {
    try {
      const newProduct = await this.product.create(product);
      return newProduct;
    } catch (error) {
      throw new Error("Unable to create product");
    }
  }

  public async update(id: string, product: Product) {
    try {
      const updatedProduct = await this.product
        .findByIdAndUpdate(id, product, { new: true })
        .exec();
      if (!updatedProduct) {
        throw new Error("Product not found");
      }
      return updatedProduct;
    } catch (error) {
      throw new Error("Unable to update product");
    }
  }

  public async delete(id: string) {
    try {
      const deletedProduct = await this.product.findByIdAndDelete(id);
      if (!deletedProduct) {
        throw new Error("Product not found");
      }
      return deletedProduct;
    } catch (error) {
      throw new Error("Unable to delete product");
    }
  }
}

export default ProductService;
