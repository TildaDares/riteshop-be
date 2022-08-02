import { sign, Secret, verify, VerifyErrors } from "jsonwebtoken";
import User from "@/resources/user/user.interface";
import Token from "@/utils/interfaces/token.interface";

export const createToken = (user: User): string => {
  return sign({ id: user._id }, process.env.JWT_SECRET as Secret, {
    expiresIn: "1d",
  });
};

export const verifyToken = async (
  token: string
): Promise<VerifyErrors | Token> => {
  return new Promise((resolve, reject) => {
    verify(token, process.env.JWT_SECRET as Secret, (err, payload) => {
      if (err) {
        return reject(err);
      }

      resolve(payload as Token);
    });
  });
};

export default { createToken, verifyToken };
