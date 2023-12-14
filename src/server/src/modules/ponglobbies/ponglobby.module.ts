import { Module } from "@nestjs/common";
import { DbModule } from "../db";
import { SseModule } from "../sse/sse.module";
import { PongLobbyService } from "./ponglobby.service";
import { PongLobbyDependencies } from "./ponglobby/dependencies";
import { PongLobbyController } from "./ponglobby.controller";
import { ChatsModule } from "../chats/chats.module";

@Module({
  imports: [DbModule, SseModule, ChatsModule],
  providers: [PongLobbyService, PongLobbyDependencies],
  controllers: [PongLobbyController],
  exports: [PongLobbyService]
})
export class PongLobbyModule {}