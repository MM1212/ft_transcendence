import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { TfaService } from '../2fa/2fa.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [SessionController],
  providers: [TfaService]
})
export class AuthSessionModule {}
