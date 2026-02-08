import * as Joi from 'joi';

export const CreateCategorySchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    // 'string.min': 'Nama kategori minimal 3 karakter bro',
    // 'any.required': 'Nama kategori jangan dikosongin ya',
  }),
  description: Joi.string().allow('', null),
});
