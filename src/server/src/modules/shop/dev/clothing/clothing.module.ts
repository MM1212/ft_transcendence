import { Module, forwardRef } from '@nestjs/common';
import { ShopModule } from '../../shop.module';
import { DevClothingListController } from './clothing.controller';
import { DevClothingListService } from './clothing.service';

@Module({
  imports: [forwardRef(() => ShopModule)],
  controllers: [DevClothingListController],
  providers: [DevClothingListService],
})
export class DevClothingListModule {}
