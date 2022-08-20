import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });
const mongoDBURI = process.env.MONGODB_URI as string;

const initializeTestingSetup = async () => {
  try {
    await mongoose.connect(mongoDBURI as string);
    console.log(`Connected to test database.`);
  } catch (err) {
    console.log(`${err} Error connecting to test database!`);
    process.exit(1);
  }
};

module.exports = initializeTestingSetup;