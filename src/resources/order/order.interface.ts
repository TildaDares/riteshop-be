import { Types } from 'mongoose';
import CartProduct from '@/resources/cart/cartProduct.interface';
import ShippingAddress from '@/utils/interfaces/shippingAddress.interface';

interface Order {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  items: Array<CartProduct>;
  shippingAddress: ShippingAddress,
  shippingFee: number,
  itemsPrice: number,
  isPaid: boolean,
  isDelivered: boolean,
  deliveredAt: Date,
  paymentMethod: string,
  total: number;
}

export default Order;
