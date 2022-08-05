import { Types } from 'mongoose';
import Product from '@/resources/product/product.interface';

interface CartProduct {
  product: Types.ObjectId | Product;
  quantity: number;
}

export default CartProduct;
