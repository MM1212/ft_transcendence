import { Module } from "@nestjs/common";
import { ShopConfigParser } from "./shop.parser";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";

@Module({
  providers: [ShopConfigParser, ShopService],
  controllers: [ShopController]
})
export class ShopModule {}