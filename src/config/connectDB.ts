import mongoose from "mongoose";

export const connectDB = () => {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
}
