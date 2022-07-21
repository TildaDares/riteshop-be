import 'dotenv/config';
import 'module-alias/register';
import validateEnv from '@/utils/validateEnv';
import App from './app';
import ProductController from '@/resources/product/product.controller';

validateEnv();

const app = new App([new ProductController()], Number(process.env.PORT));

app.listen();
