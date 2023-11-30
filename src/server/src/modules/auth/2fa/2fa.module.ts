import { Module } from '@nestjs/common';
import { TfaController } from './2fa.controller';
import { TfaService } from './2fa.service';

@Module({
  controllers: [TfaController],
  providers: [TfaService],
})
export class AuthTfaModule {}
