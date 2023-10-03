import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IntraAPI } from '@/helpers/Intra';

@Module({
  controllers: [AuthController],
  providers: [AuthService, IntraAPI],
})
export class AuthModule {}
