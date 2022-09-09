import { Schema, model } from 'mongoose';
import Order from '@/resources/order/order.interface';

const Order = new Schema(
  {
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
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      tel: { type: String, required: true },
      country: { type: String, required: true },
    },
    isPaid: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    paymentMethod: String,
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    }
  }, { timestamps: true }
);

export default model<Order>('Order', Order);
