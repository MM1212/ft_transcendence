import { ChatsService } from "@/modules/chats/chats.service";
import { SseService } from "@/modules/sse/sse.service";
import { UsersService } from "@/modules/users/services/users.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LobbyServices {
  constructor(
    public readonly chats: ChatsService,
    public readonly users: UsersService,
    public readonly sse: SseService
  ) {}
}