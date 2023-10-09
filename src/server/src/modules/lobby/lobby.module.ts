import { Module, forwardRef } from '@nestjs/common';
import { LobbyGateway } from './lobby.gateway';
import { AppModule } from '@/app.module';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [LobbyGateway],
})
export class LobbyModule {}
