import * as Joi from 'joi';

export const CreateProductSchema = Joi.object({
  category_id: Joi.string().required(),
  name: Joi.string().required(),
  sku: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().allow('', null),
});

export const UpdateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  sku: Joi.string().uppercase().optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().allow('').optional(),
}).min(1);

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
