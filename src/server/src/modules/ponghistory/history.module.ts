import { Module } from "@nestjs/common";
import { DbModule } from "../db";
import { PongHistoryService } from "./history.service";
import { PongHistoryController } from "./history.controller";

@Module({
  imports: [DbModule],
  providers: [PongHistoryService],
  controllers: [PongHistoryController]
})
export class PongHistoryModule {}