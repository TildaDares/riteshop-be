import { Schema, model } from 'mongoose';
import Cart from '@/resources/cart/cart.interface';

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      min: 0,
      default: 1,
    },
  }],
  bill: {
    type: Number,
    required: true,
    default: 0,
  }
}, { timestamps: true });

export default model<Cart>('Cart', CartSchema);
