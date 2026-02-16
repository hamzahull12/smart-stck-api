import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import { ProductsService } from 'src/products/products.service';
import { UpdateStockDto, UpdateStockSchema } from './dto/update-stock.dto';
import { JwtAuthGuard } from 'src/commons/security/jwt-auth.guard';
import { RolesGuard } from 'src/commons/security/roles.guard';
import { Roles } from 'src/commons/decorators/roles.decorator';

@ApiTags('Inventory History (stok)')
@Controller('stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('update')
  @HttpCode(201)

  // Hanya user dengan role 'admin' yang bisa akses method ini
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update stok barang (IN/OUT) - Khusus Admin' })
  @ApiResponse({ status: 201, description: 'Berhasil update stok' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Hanya Admin yang boleh mengubah stok',
  })
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
