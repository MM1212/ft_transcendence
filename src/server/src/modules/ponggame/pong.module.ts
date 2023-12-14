import { AppModule } from '@/app.module';
import { Module, forwardRef } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { PongLobbyModule } from '../ponglobbies/ponglobby.module';
import { UsersModule } from '../users/users.module';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';

@Module({
  imports: [forwardRef(() => AppModule), forwardRef(() => PongLobbyModule), UsersModule],
  providers: [PongService, PongGateway, AuthGatewayGuard],
  exports: [PongService],
})
export class PongModule {}
