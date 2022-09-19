import dotenv from 'dotenv';
import users from './users';
import products from './products';
import User from '@/resources/user/user.model';
import Product from '@/resources/product/product.model';
import { connectDB } from '@/config/connectDB';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`) });
connectDB();

const importData = async () => {
  try {
    // delete all the current data in all three collections
    await destroyData()
    await insertData()
    console.log('Data inserted into DB');
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    console.log('Data deleted from DB');
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

const insertData = async () => {
  try {
    await User.insertMany(users);
    await Product.insertMany(products);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

// check the npm flag and call appropriate function
if (process.argv[2] === '-d') {
  destroyData();
  process.exit();
} else importData();