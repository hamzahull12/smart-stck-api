import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import * as createProductSchema from './schema/create-product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  async createProduct(
    @Body(new JoiValidationPipe(createProductSchema.CreateProductSchema))
    payload: createProductSchema.CreateProduct,
  ) {
    const productId = await this.productsService.addProduct(payload);
    return {
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data: {
        productId,
      },
    };
  }
}
