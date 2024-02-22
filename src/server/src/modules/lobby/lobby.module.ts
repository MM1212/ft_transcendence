import { Module, forwardRef } from '@nestjs/common';
import { LobbyGateway } from './lobby.gateway';
import { AppModule } from '@/app.module';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';
import { LobbyService } from './lobby.service';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { LobbyServices } from './src/Services';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [forwardRef(() => AppModule), ChatsModule, UsersModule, SseModule],
  providers: [LobbyGateway, AuthGatewayGuard, LobbyServices, LobbyService ],
})
export class LobbyModule {}
