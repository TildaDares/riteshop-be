import { Document, Types } from "mongoose";

interface User extends Document {
  _id?: Types.ObjectId;
  email: string;
  name: string;
  googleId?: string;
  password: string;
  role: string;

  isValidPassword(password: string): Promise<Error | boolean>;
}

export default User;
