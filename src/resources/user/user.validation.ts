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
});

const update = Joi.object({
  name: Joi.string()
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
});

const changePassword = Joi.object({
  oldPassword: Joi.string()
    .min(8)
    .max(30)
    .required(),
  newPassword: Joi.string()
    .min(8)
    .max(30)
    .required(),
  confirmNewPassword: Joi.string()
    .min(8)
    .max(30)
    .required(),
});

const login = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required(),
});

export default { register, update, changePassword, login };
