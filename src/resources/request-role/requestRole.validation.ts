import Joi from 'joi';
import { RoleEnum } from '@/utils/enums/role.enum';

const create = Joi.object({
  requestedRole: Joi.string()
    .lowercase()
    .trim()
    .valid(RoleEnum.CUSTOMER, RoleEnum.ADMIN, RoleEnum.SALESAGENT)
    .required(),
});

const update = Joi.object({
  status: Joi.string()
    .lowercase()
    .trim()
    .valid('pending', 'approved', 'rejected')
    .required(),
});

export default { create, update };
