import { Module } from "@nestjs/common";
import { DbModule } from "../db";
import { SseModule } from "../sse/sse.module";
import { PongLobbyService } from "./ponglobby.service";
import { PongLobbyDependencies } from "./ponglobby/dependencies";
import { PongLobbyController } from "./ponglobby.controller";

@Module({
  imports: [DbModule, SseModule],
  providers: [PongLobbyService, PongLobbyDependencies],
  controllers: [PongLobbyController],
  exports: [PongLobbyService]
})
export class PongLobbyModule {}