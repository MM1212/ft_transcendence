import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAPI } from '@/helpers/Intra';
import { DbModule } from '@/modules/db';
import { ShopModule } from '@/modules/shop/shop.module';

@Global()
@Module({
  imports: [DbModule, ShopModule],
  controllers: [AuthController],
  providers: [AuthService, IntraAPI],
  exports: [AuthService, IntraAPI],
})
export class Auth42Module {}
