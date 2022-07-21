import {
  Request, Response, NextFunction, RequestHandler,
} from 'express';
import Joi from 'joi';

function validationMiddleware(schema: Joi.Schema): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true, // prevents an error if unknown properties are passed
      stripUnknown: true, // removes unknown properties from the output
    };

    try {
      const value = await schema.validateAsync(req.body, validationOptions);
      req.body = value;
      next();
    } catch (e) {
      const errors: string[] = [];
      e.details.forEach((error: Joi.ValidationErrorItem) => {
        errors.push(error.message);
      });
      res.status(400).send({ errors });
    }
  };
}

export default validationMiddleware;
