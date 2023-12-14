import { ChatsService } from '@/modules/chats/chats.service';
import { DbService } from '@/modules/db';
import { PongService } from '@/modules/ponggame/pong.service';
import { SseService } from '@/modules/sse/sse.service';
import { UsersService } from '@/modules/users/users.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';

// This file holds the dependencies that the PongLobby class needs to operate.

@Injectable()
export class PongLobbyDependencies {
  @Inject(DbService) readonly db: DbService;
  @Inject(SseService) readonly sseService: SseService;
  @Inject(UsersService) readonly usersService: UsersService;
  @Inject(ChatsService) readonly chatsService: ChatsService;
  @Inject(forwardRef(() => PongService)) readonly gameService: PongService;
  readonly service: any;
}
