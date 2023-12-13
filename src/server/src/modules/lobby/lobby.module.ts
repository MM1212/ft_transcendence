import { Module, forwardRef } from '@nestjs/common';
import { LobbyGateway } from './lobby.gateway';
import { AppModule } from '@/app.module';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';

@Module({
  imports: [forwardRef(() => AppModule)],
  providers: [LobbyGateway, AuthGatewayGuard],
})
export class LobbyModule {}
