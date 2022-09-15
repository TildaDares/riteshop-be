import Joi from 'joi';

const create = Joi.object({
  name: Joi.string()
    .min(3)
    .required(),
  description: Joi.string()
    .min(3)
    .required(),
  price: Joi.number()
    .min(0)
    .required(),
  quantity: Joi.number()
    .min(0)
    .required(),
  image: Joi.binary(),
});

export default { create };
