import { Module } from "@nestjs/common";
import { SseService } from "./sse.service";
import { SseController } from "./sse.controller";
import { AuthModule } from "../auth/42/auth.module";

@Module({
  imports: [AuthModule],
  providers: [SseService],
  exports: [SseService],
  controllers: [SseController]
})
export class SseModule {}