import { Schema, model } from "mongoose";
import { compare, hash } from "bcrypt";
import User from "@/resources/user/user.interface";
import { RoleEnum } from '@/utils/enums/role.enum';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      trim: true,
    },
    googleId: String,
    password: {
      type: String,
    },
    role: {
      type: String,
      default: RoleEnum.CUSTOMER,
      enum: Object.values(RoleEnum)
    },
  },
  { timestamps: true }
);

UserSchema.pre<User>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 8);
  }
  next();
});

UserSchema.methods.isValidPassword = async function (
  password: string
): Promise<Error | boolean> {
  return await compare(password, this.password);
};

export default model<User>("User", UserSchema);
