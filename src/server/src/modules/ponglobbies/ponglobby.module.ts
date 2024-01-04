import { Module, forwardRef } from '@nestjs/common';
import { DbModule } from '../db';
import { SseModule } from '../sse/sse.module';
import { PongLobbyService } from './ponglobby.service';
import { PongLobbyDependencies } from './ponglobby/dependencies';
import { PongLobbyController } from './ponglobby.controller';
import { ChatsModule } from '../chats/chats.module';
import { PongModule } from '../ponggame/pong.module';
import { PongQueueService } from '../pongqueue/pongqueue.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DbModule, SseModule, ChatsModule, forwardRef(() => PongModule), UsersModule],
  providers: [PongLobbyService, PongLobbyDependencies, PongQueueService],
  controllers: [PongLobbyController],
  exports: [PongLobbyService, PongQueueService],
})
export class PongLobbyModule {}
