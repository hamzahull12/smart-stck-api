import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import { CreateCategorySchema } from './schemas/create-category.schema';
import type { CreateCategory } from './interfaces/category.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(201)
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
  async findOne(@Param('id') id: number) {
    const category = await this.categoriesService.getAllByid(id);
    return {
      status: 'success',
      data: {
        category,
      },
    };
  }

  @Get(':id/products')
  async findProductsByIdCategory(@Param('id') id: string) {
    const data = await this.categoriesService.getProductByCategoriey(id);
    return {
      status: 'success',
      data,
    };
  }
}
