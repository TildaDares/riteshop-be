import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/token';
import UserModel from '@/resources/user/user.model';
import Token from '@/utils/interfaces/token.interface';
import HTTPException from '@/utils/exceptions/http.exception';
import { JsonWebTokenError } from 'jsonwebtoken';
import { redisClient as client } from '@/config/redis';

async function authenticatedMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer')) {
    return next(new HTTPException(401, "Unauthorised"));
  }

  const accessToken = bearer.split('Bearer ')[1].trim();

  try {
    const payload: Token | JsonWebTokenError = await verifyToken(accessToken)

    if (payload instanceof JsonWebTokenError) {
      return next(new HTTPException(401, "Unauthorised"));
    }

    // token in deny list?
    const inDenyList = await client.get(`bl_${accessToken}`);
    if (inDenyList) {
      return next(new HTTPException(401, "JWT Rejected"));
    }

    const user = await UserModel.findById(payload.id)
      .select('-password')
      .exec();

    if (!user) {
      return next(new HTTPException(401, 'Unauthorised'));
    }

    req.user = user
    req.tokenExp = payload.exp;
    req.token = accessToken;

    return next();
  } catch (error) {
    return next(new HTTPException(401, "Unauthorised"));
  }
}

export default authenticatedMiddleware;
