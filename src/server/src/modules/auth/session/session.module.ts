import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { Auth42Module } from '../42/auth.module';

@Module({
  imports: [Auth42Module],
  controllers: [SessionController],
})
export class AuthSessionModule {}
