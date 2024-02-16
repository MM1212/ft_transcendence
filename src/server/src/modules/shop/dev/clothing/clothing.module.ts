import { Module, forwardRef } from '@nestjs/common';
import { ShopModule } from '../../shop.module';
import { DevClothingListController } from './clothing.controller';
import { DevClothingListService } from './clothing.service';
import { SseModule } from '@/modules/sse/sse.module';

@Module({
  imports: [forwardRef(() => ShopModule), SseModule],
  controllers: [DevClothingListController],
  providers: [DevClothingListService],
})
export class DevClothingListModule {}
