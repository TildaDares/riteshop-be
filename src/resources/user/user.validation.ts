import Joi from "joi";

const register = Joi.object({
  name: Joi.string()
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  googleId: Joi.string(),
  password: Joi.string()
    .min(8)
    .max(30)
    .required(),
  role: Joi.string()
    .valid('customer', 'admin', 'salesagent'),
});

const login = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required(),
});

export default { register, login };
