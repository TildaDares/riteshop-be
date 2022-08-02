import ProductModel from "@/resources/product/product.model";
import Product from "@/resources/product/product.interface";

class ProductService {
  private product = ProductModel;

  public async getAllProducts(): Promise<Product[]> {
    try {
      const products = await this.product.find({});
      return products;
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

  public async findProducts(name: string) {
    try {
      if (name) {
        const products = await this.product.aggregate().search({
          index: 'searchProducts',
          text: {
            query: name,
            path: {
              'wildcard': '*'
            },
            fuzzy: {},
          },
        })

        if (!products) {
          throw new Error("No products match that query")
        }
        return products;
      }
    } catch (error) {
      throw new Error("Unable to find products that match your search term");
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

  public async edit(id: string, product: Product) {
    try {
      const updatedProduct = await this.product
        .findByIdAndUpdate(id, product, { new: true })
        .exec();
      if (!updatedProduct) {
        throw new Error("Product not found");
      }
      return updatedProduct;
    } catch (error) {
      throw new Error("Unable to edit product");
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
