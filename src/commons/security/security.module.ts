import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenManagerService } from './Token-Manager.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [TokenManagerService],
  exports: [TokenManagerService],
})
export class SecurityModule {}
