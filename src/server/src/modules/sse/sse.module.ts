import { Module } from "@nestjs/common";
import { SseService } from "./sse.service";
import { SseController } from "./sse.controller";
import { Auth42Module } from "../auth/42/auth.module";

@Module({
  imports: [Auth42Module],
  providers: [SseService],
  exports: [SseService],
  controllers: [SseController]
})
export class SseModule {}