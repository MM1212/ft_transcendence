import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAPI } from '@/helpers/Intra';
import { DbModule } from '@/modules/db';

@Module({
  imports: [DbModule],
  controllers: [AuthController],
  providers: [AuthService, IntraAPI],
})
export class AuthModule {}
