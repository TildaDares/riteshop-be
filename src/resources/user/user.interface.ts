import { Document } from "mongoose";

interface User extends Document {
  _id?: string;
  email: string;
  name: string;
  googleId?: string;
  password: string;
  role: string;

  isValidPassword(password: string): Promise<Error | boolean>;
}

export default User;
