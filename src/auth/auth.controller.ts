import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import {
  LoginDto,
  LoginSchema,
  LogoutDto,
  RefreshToken,
  RefreshTokenDto,
} from './dto/login.dto';
import { JwtAuthGuard } from 'src/commons/security/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Berhasil mendapatkan token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async loginUser(
    @Body(new JoiValidationPipe(LoginSchema)) loginDto: LoginDto,
  ) {
    return await this.authService.login(loginDto);
  }

  @Put('refresh')
  async refreshToken(
    @Body(new JoiValidationPipe(RefreshToken)) refreshTokenDto: RefreshTokenDto,
  ) {
    return await this.authService.refreshAccessToken(
      refreshTokenDto.refreshToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Swagger: Munculkan tombol gembok
  @ApiOperation({
    summary: 'Logout User',
    description: 'Menghapus refresh token dari database agar sesi berakhir',
  })
  @ApiResponse({ status: 200, description: 'Logout Berhasil' })
  @ApiResponse({ status: 401, description: 'Token tidak valid atau expired' })
  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(RefreshToken))
  async logoutUser(@Req() req: any, @Body() logoutDto: LogoutDto) {
    const userId: string = req.user.userId;
    const { refreshToken } = logoutDto;

    return await this.authService.logout(userId, refreshToken);
  }
}
