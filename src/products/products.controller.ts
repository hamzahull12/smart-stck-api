import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import * as createProductSchema from './schema/create-product.schema';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Menambahkan produk baru' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Produk berhasil ditambahkan' })
  @ApiResponse({ status: 409, description: 'SKU sudah terdaftar' })
  @ApiResponse({ status: 404, description: 'Kategori tidak ditemukan' })
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

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua produk (bisa search & filter)' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Cari berdasarkan nama produk',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    description: 'Filter berdasarkan ID kategori',
  })
  @ApiResponse({ status: 200, description: 'Daftar produk berhasil diambil' })
  async findAll(@Query() query: createProductSchema.ProductQueryFilter) {
    const products = await this.productsService.getAllproduct(query);
    return {
      status: 'success',
      data: {
        products,
      },
    };
  }
}
