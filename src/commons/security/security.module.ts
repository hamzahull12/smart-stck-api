import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenManagerService } from './Token-Manager.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({}),
  ],
  providers: [TokenManagerService, JwtStrategy],
  exports: [TokenManagerService, PassportModule],
})
export class SecurityModule {}
