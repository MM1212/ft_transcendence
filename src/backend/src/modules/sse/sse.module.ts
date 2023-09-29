import { Module } from "@nestjs/common";
import { SseService } from "./sse.service";
import { SseController } from "./sse.controller";

@Module({
  providers: [SseService],
  controllers: [SseController]
})
export class SseModule {}