import { Module, forwardRef } from '@nestjs/common';
import { LobbyGateway } from './lobby.gateway';
import { AppModule } from '@/app.module';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';
import { LobbyService } from './lobby.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [LobbyGateway, AuthGatewayGuard, LobbyService],
})
export class LobbyModule {}
