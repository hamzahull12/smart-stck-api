import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import * as createProductSchema from './schema/create-product.schema';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
  async findProductsAll(
    @Query() query: createProductSchema.ProductQueryFilter,
  ) {
    const products = await this.productsService.getAllproduct(query);
    return {
      status: 'success',
      data: {
        products,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail satu kategori' })
  @ApiParam({ name: 'id', description: 'ID Kategori (NanoID)' })
  @ApiResponse({ status: 200, description: 'Data ditemukan' })
  @ApiResponse({ status: 404, description: 'Kategori tidak ditemukan' })
  async findProductById(@Param('id') id: string) {
    const product = await this.productsService.getProductByid(id);
    return {
      status: 'success',
      data: {
        product,
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update data produk' })
  async updateProduct(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(createProductSchema.UpdateProductSchema))
    updateProductDto: UpdateProductDto,
  ) {
    await this.productsService.updateProduct(id, updateProductDto);
    return {
      status: 'success',
      message: 'Data produk berhasil diperbarui',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete produk' })
  @ApiResponse({ status: 200, description: 'Produk berhasil dihapus' })
  async softRemove(@Param('id') id: string) {
    await this.productsService.softDeleteProduct(id);
    return {
      status: 'success',
      message: 'Produk berhasil dihapus (soft delete)',
    };
  }
}
