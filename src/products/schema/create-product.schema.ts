import * as Joi from 'joi';

export const CreateProductSchema = Joi.object({
  category_id: Joi.string().required(),
  name: Joi.string().required(),
  sku: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().allow('', null),
});

export interface CreateProduct {
  category_id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  description?: string;
}

export interface ProductQueryFilter {
  search?: string;
  category_id?: string;
}
