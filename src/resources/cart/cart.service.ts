import CartModel from "@/resources/cart/cart.model";
import Cart from "@/resources/cart/cart.interface";
import ProductModel from "@/resources/product/product.model";
import CartProduct from "@/resources/cart/cartProduct.interface";
import Product from "@/resources/product/product.interface";

class CartService {
  private cart = CartModel;

  private product = ProductModel;

  public async getCartByUser(userId: string): Promise<Cart> {
    try {
      const cart = await this.cart
        .findOne({ user: userId })
        .populate({
          path: 'items.product',
          select: 'name description price image quantity',
        })
        .populate('user', 'name email')
        .exec();
      if (!cart) {
        throw new Error("Unable to get cart");
      }
      return cart;
    } catch (error) {
      throw new Error("Unable to get cart");
    }
  }

  public async addToCart(item: CartProduct, userId: string): Promise<Cart> {
    try {
      const { product: productId, quantity } = item;
      const prod = await this.product.findById(productId).exec();
      if (!prod) {
        throw new Error("Product not found");
      }
      const cart = await this.cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'price',
      }).exec();

      if (quantity > prod.quantity) {
        throw new Error("Not enough quantity");
      }

      // cart already exists
      if (cart) {
        const productIndex = cart.items.findIndex(i => i.product._id.toString() == prod._id.toString());

        // product not in cart
        if (productIndex < 0) {
          const updatedCart = await this.cart.findByIdAndUpdate(cart._id, {
            $push: {
              items: {
                product: prod._id,
                quantity,
              },
            },
            $set: {
              bill: cart.bill + prod.price * quantity,
            },
          }, { new: true }).exec();
          return updatedCart as Cart;
        } else { // If item exists, update quantity
          const product = cart.items[productIndex];
          const newQuantity = product.quantity + quantity;

          // throw error if cart quantity is greater than product quantity || quantity is equal to product quantity
          if (newQuantity > prod.quantity) {
            throw new Error("Not enough quantity");
          }

          product.quantity += quantity;
          cart.bill = cart.bill + prod.price * quantity;

          cart.items[productIndex] = product;
          await cart.save();
          return cart;
        }
      } else {
        const newCart = await this.cart.create({
          user: userId,
          items: [{
            product: prod._id,
            quantity,
          }],
          bill: prod.price * quantity,
        });
        return newCart;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async updateCartProduct(item: CartProduct, userId: string): Promise<Cart> {
    try {
      const { product: productId, quantity } = item;
      const cart = await this.cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'price quantity',
      }).exec();

      // cart already exists
      if (cart) {
        const productIndex = cart.items.findIndex(i => i.product._id.toString() == productId);

        // product not in cart
        if (productIndex < 0) {
          throw new Error("Product not found in your cart");
        } else { // If item exists, update quantity

          // remove item from cart if quantity is 0
          if (quantity <= 0) {
            return this.deleteProductFromCart(cart, productIndex);
          }

          const product = cart.items[productIndex];
          if (quantity > (product.product as Product).quantity) {
            throw new Error("Not enough quantity");
          }

          product.quantity = quantity;
          cart.bill = cart.items.reduce((acc, curr) => {
            return acc + curr.quantity * (curr.product as Product).price;
          }, 0)

          cart.items[productIndex] = product;
          await cart.save();
          return cart;
        }
      } else {
        throw new Error("Unable to update cart");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async removeFromCart(productId: string, userId: string): Promise<Cart> {
    try {
      const cart = await this.cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'price',
      }).exec();

      if (!cart) {
        throw new Error("Product not found in your cart");
      }

      const productIndex = cart.items.findIndex(i => i.product._id.toString() === productId);
      if (productIndex < 0) {
        throw new Error("Product not found in your cart");
      } else {
        return this.deleteProductFromCart(cart, productIndex);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async emptyCart(userId: string): Promise<Cart> {
    try {
      const cart = await this.cart.findOne({ user: userId }).exec();
      if (!cart) {
        throw new Error("Cart not found");
      }
      cart.items = [];
      cart.bill = 0;
      return await cart.save();
    } catch (error) {
      throw new Error("Cart not found");
    }
  }

  private async deleteProductFromCart(cart: Cart, productIndex: number): Promise<Cart> {
    try {
      const item = cart.items[productIndex];

      cart.bill -= item.quantity * (item.product as Product).price;
      if (cart.bill < 0) {
        cart.bill = 0;
      }
      cart.items.splice(productIndex, 1);
      cart.bill = cart.items.reduce((acc, curr) => {
        return acc + curr.quantity * (curr.product as Product).price;
      }, 0)
      cart = await cart.save();
      return cart;
    } catch (error) {
      throw new Error("Unable to remove product from cart");
    }
  }
}

export default CartService;
