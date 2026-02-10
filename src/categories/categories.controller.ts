import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import { CreateCategorySchema } from './schemas/create-category.schema';
import type { CreateCategory } from './interfaces/category.interface';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/category-response.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Membuat kategori baru' })
  @ApiBody({ type: CreateCategoryDto }) // Memberitahu Swagger bentuk body-nya
  @ApiResponse({ status: 201, description: 'Kategori berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Nama kategori sudah digunakan' })
  async create(
    @Body(new JoiValidationPipe(CreateCategorySchema)) paylaod: CreateCategory,
  ) {
    const categoriId = await this.categoriesService.addCategory(paylaod);
    return {
      status: 'success',
      message: 'Categori berhasil ditambahkan',
      data: {
        categoriId,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua daftar kategori' })
  @ApiResponse({ status: 200, description: 'Daftar kategori berhasil diambil' })
  async findAll() {
    const categories = await this.categoriesService.getAllCategories();
    return {
      status: 'success',
      data: {
        categories,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail satu kategori' })
  @ApiParam({ name: 'id', description: 'ID Kategori (NanoID)' })
  @ApiResponse({ status: 200, description: 'Data ditemukan' })
  @ApiResponse({ status: 404, description: 'Kategori tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.getAllByid(id);
    return {
      status: 'success',
      data: {
        category,
      },
    };
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Mendapatkan semua produk dalam kategori tertentu' })
  @ApiParam({ name: 'id', description: 'ID Kategori' })
  @ApiResponse({ status: 200, description: 'Daftar produk berhasil diambil' })
  async findProductsByIdCategory(@Param('id') id: string) {
    const data = await this.categoriesService.getProductByCategoriey(id);
    return {
      status: 'success',
      data,
    };
  }
}
