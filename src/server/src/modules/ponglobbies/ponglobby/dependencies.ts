import { DbService } from "@/modules/db";
import { SseService } from "@/modules/sse/sse.service";
import { UsersService } from "@/modules/users/users.service";
import { Inject, Injectable } from "@nestjs/common";

// This file holds the dependencies that the PongLobby class needs to operate.

@Injectable()
export class PongLobbyDependencies {
  @Inject(DbService) readonly db: DbService;
  @Inject(SseService) readonly sseService: SseService;
  @Inject(UsersService) readonly usersService: UsersService;
  readonly service: any;
}
