import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import { ProductsService } from 'src/products/products.service';
import { UpdateStockDto, UpdateStockSchema } from './dto/update-stock.dto';

@ApiTags('Inventory History (stok)')
@Controller('stock')
export class StockController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('update')
  @HttpCode(201)
  @ApiOperation({ summary: 'Update stok barang (IN/OUT)' })
  @ApiResponse({ status: 201, description: 'Berhasil update' })
  async updateStok(
    @Body(new JoiValidationPipe(UpdateStockSchema)) dto: UpdateStockDto,
  ) {
    return await this.productsService.updateStock(dto);
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Lihat histori mutasi barang (Global)',
    description:
      'Menampilkan riwayat stok masuk dan keluar dari semua produk secara real-time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar riwayat stok berhasil diambil.',
  })
  async getAllHistoryLog() {
    return await this.productsService.getALlStockLog();
  }
}
