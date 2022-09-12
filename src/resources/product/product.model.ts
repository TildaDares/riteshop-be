import { Schema, model } from 'mongoose';
import Product from '@/resources/product/product.interface';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      minLength: 1,
      required: true,
    },
    description: {
      type: String,
      minLength: 1,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

ProductSchema.index(
  {
    name: 'text',
  },
  {
    weights: {
      name: 3,
      description: 2
    },
  }
);

export default model<Product>('Product', ProductSchema);
