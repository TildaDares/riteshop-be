import Joi from 'joi';

const create = Joi.object({
  item:
    Joi.object({
      product: Joi.string(),
      quantity: Joi.number()
        .min(0)
    })
});

export default { create };
