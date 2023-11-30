import { Module } from "@nestjs/common";
import { SseModule } from "../sse/sse.module";
import { DbModule } from "../db";
import { ChatsService } from "./chats.service";
import { ChatsController } from "./chats.controller";
import { ChatDependencies } from "./chat/dependencies";

@Module({
  imports: [DbModule, SseModule],
  providers: [ChatsService, ChatDependencies],
  controllers: [ChatsController],
  exports: [ChatsService]
})
export class ChatsModule {}