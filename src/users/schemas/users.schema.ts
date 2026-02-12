import * as Joi from 'joi';

export const userSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  fullname: Joi.string().max(100).required(),
  role: Joi.string().valid('admin', 'staff').optional(),
});
