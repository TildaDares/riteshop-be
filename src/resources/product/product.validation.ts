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
  image: Joi.string().required()
});

const edit = Joi.object({
  name: Joi.string()
    .min(3),
  description: Joi.string()
    .min(3),
  price: Joi.number()
    .min(0),
  quantity: Joi.number()
    .min(0),
  image: Joi.string()
});

export default { create, edit };
