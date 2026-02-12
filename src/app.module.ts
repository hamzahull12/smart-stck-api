import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { UsersModule } from './users/users.module';
import { SecurityModule } from './commons/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SecurityModule,
    DatabaseModule,
    CategoriesModule,
    ProductsModule,
    StockModule,
    UsersModule,
  ],
})
export class AppModule {}
