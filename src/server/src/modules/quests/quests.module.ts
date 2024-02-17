import { Module } from "@nestjs/common";
import { QuestsService } from "./quests.service";

@Module({
  providers: [QuestsService],
  exports: [QuestsService]
})
export class QuestsModule {}