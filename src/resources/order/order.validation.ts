import Joi from 'joi';

const create = Joi.object({
  shippingFee: Joi.number().required(),
  shippingAddress: Joi.object({
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    postalCode: Joi.string().trim().required(),
    tel: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
  }).required(),
});

const update = Joi.object({
  isPaid: Joi.boolean(),
  isDelivered: Joi.boolean(),
  deliveredAt: Joi.date().iso(),
  shippingAddress: Joi.object({
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    postalCode: Joi.string().trim().required(),
    tel: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
  }).required(),
});

export default { create, update };
