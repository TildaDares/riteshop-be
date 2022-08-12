import HTTPException from '@/utils/exceptions/http.exception';
import { Request, Response, NextFunction } from 'express';
import User from "@/resources/user/user.interface";

function isAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = req.user as User;
  if (user.role !== 'admin') {
    return next(new HTTPException(401, "You don't have enough permissions to perform this action"));
  }
  return next();
}

export default isAdmin;
