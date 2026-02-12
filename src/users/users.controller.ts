import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/commons/pipes/joi-validation.pipe';
import { userSchema } from './schemas/users.schema';
import { CreateUserDto } from './dto/register-dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Register User baru' })
  async registerUser(
    @Body(new JoiValidationPipe(userSchema)) createUserdto: CreateUserDto,
  ) {
    const userId = await this.usersService.createUser(createUserdto);
    return {
      status: 'success',
      message: 'User berhasil didaftarkakn',
      data: {
        userId,
      },
    };
  }
}
