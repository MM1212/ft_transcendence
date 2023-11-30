import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAPI } from '@/helpers/Intra';
import { DbModule } from '@/modules/db';

@Global()
@Module({
  imports: [DbModule],
  controllers: [AuthController],
  providers: [AuthService, IntraAPI],
  exports: [AuthService, IntraAPI],
})
export class Auth42Module {}
