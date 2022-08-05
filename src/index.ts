import 'dotenv/config';
import 'module-alias/register';
import validateEnv from '@/utils/validateEnv';
import App from '@/app';
import ProductController from '@/resources/product/product.controller';
import UserController from '@/resources/user/user.controller';
import AuthController from '@/resources/auth/auth.controller';
import CartController from '@/resources/cart/cart.controller';

validateEnv();

const app = new App([
  new AuthController(),
  new UserController(),
  new ProductController(),
  new CartController()
]);

app.listen(Number(process.env.PORT));
