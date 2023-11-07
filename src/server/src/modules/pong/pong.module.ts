import { Module, forwardRef } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { AppModule } from '@/app.module';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [PongGateway],
})
export class PongModule {}
