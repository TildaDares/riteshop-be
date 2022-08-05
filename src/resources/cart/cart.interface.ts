import { Document, Types } from 'mongoose';
import CartProduct from '@/resources/cart/cartProduct.interface';

interface Cart extends Document {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  items: Array<CartProduct>;
  bill: number;
}

export default Cart;
