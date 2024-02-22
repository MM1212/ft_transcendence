import { Module, forwardRef, type ModuleMetadata } from '@nestjs/common';
import { ShopConfigParser } from './shop.parser';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { IS_PROD } from '@/helpers/constants';
import { DevClothingListModule } from './dev/clothing/clothing.module';

@Module({
  providers: [ShopConfigParser, ShopService],
  controllers: [ShopController],
  exports: [ShopService],
  imports: [!IS_PROD && forwardRef(() => DevClothingListModule)].filter(
    Boolean,
  ) as ModuleMetadata['imports'],
})
export class ShopModule {}
