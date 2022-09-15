import OrderModel from "@/resources/order/order.model";
import Order from "@/resources/order/order.interface";
import CartModel from "@/resources/cart/cart.model";
import ProductModel from "@/resources/product/product.model";
import Paypal from "@/config/paypal"
import ShippingAddress from '@/utils/interfaces/shippingAddress.interface';
import Product from "../product/product.interface";
import User from "@/resources/user/user.interface";
import HTTPException from "@/utils/exceptions/http.exception";

class OrderService {
  private order = OrderModel;

  private cart = CartModel;

  private product = ProductModel;

  private paypal = new Paypal();

  public async getAll() {
    try {
      const orders = await this.order
        .find({})
        .populate({
          path: 'items.product',
          select: 'image price quantity name',
        })
        .populate('user', 'role name email')
        .sort({ createdAt: -1 }).exec();
      const count = await this.order.countDocuments()
      if (!orders) {
        throw new Error("No orders found");
      }
      return { orders, count };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getOrderById(id: string, user: User): Promise<Order> {
    try {
      const order = await this.order
        .findById(id)
        .populate({
          path: 'items.product',
          select: 'image price quantity name',
        })
        .populate('user', 'name email role')
        .exec();
      if (!order) {
        throw new Error("Order not found");
      }
      if (order?.user._id.toString() != user._id?.toString() && user.role !== 'admin') {
        throw new HTTPException(401, "You don't have enough permissions to perform this action");
      }
      return order;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      throw new Error(error.message);
    }
  }

  public async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const orders = await this.order
        .find({ user: userId })
        .populate({
          path: 'items.product',
          select: 'image price quantity name',
        })
        .populate('user', '_id name email')
        .sort({ createdAt: -1 }).exec();
      if (!orders) {
        throw new Error("No orders found");
      }
      return orders;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async createPaypalTransaction(total: string) {
    try {
      const order = await this.paypal.createOrder(total);
      return order
    } catch (error) {
      throw new Error(error.message)
    }
  }

  public async capturePayment(paypalOrderId: string, orderId: string) {
    try {
      const captureData = await this.paypal.capturePayment(paypalOrderId);
      const order = await this.order
        .findOneAndUpdate({ _id: orderId }, { $set: { isPaid: true, paymentMethod: 'paypal' } })
        .populate({
          path: 'items.product',
          select: 'price quantity',
        })
        .exec();
      const promises = order?.items.map(async (item) => {
        const newQty = (item.product as Product).quantity - item.quantity
        return await this.product.findOneAndUpdate({ _id: item.product._id }, { $set: { quantity: newQty < 0 ? 0 : newQty } }) as Product
      })
      const tuple = <T extends any[]>(...args: T): T => args
      await Promise.all(tuple(promises))
      return captureData;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  public async createOrder(userId: string, shippingAddress: ShippingAddress, shippingFee: number): Promise<Order> {
    try {
      const cart = await this.cart.findOne({ user: userId })
      if (!cart) {
        throw new Error("Cart not found")
      }

      if (cart.items.length == 0) {
        throw new Error("There are no items in the cart")
      }

      const order = this.order.create({
        user: userId,
        shippingFee,
        itemsPrice: cart.bill,
        total: Number(shippingFee) + cart.bill,
        items: cart.items,
        shippingAddress,
      })
      cart.items = []
      cart.bill = 0
      await cart.save()
      return order
    } catch (error) {
      throw new Error(error.message)
    }
  }

  public async updateOrder(id: string, body: Order, user: User): Promise<Order> {
    try {
      await this.getOrderById(id, user)
      // only update orders that have not been delivered
      const updatedOrder = await this.order
        .findOneAndUpdate({ _id: id, isDelivered: false }, { $set: body }, { new: true })
        .exec() as Order
      return updatedOrder
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      throw new Error(error.message);
    }
  }
}

export default OrderService;
