import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [StockController],
})
export class StockModule {}
