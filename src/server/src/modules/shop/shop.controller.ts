import { Controller, Get, Param, Post } from '@nestjs/common';
import { ShopService } from './shop.service';
import { Auth } from '../auth/decorators';
import ShopModel from '@typings/models/shop';
import { InternalEndpointResponse } from '@typings/api';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';

@Auth()
@Controller()
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get(ShopModel.Endpoints.Targets.GetInitialData)
  public async getInitialData(): Promise<
    InternalEndpointResponse<ShopModel.Endpoints.GetInitialData>
  > {
    return await this.service.getInitialData();
  }

  @Get(ShopModel.Endpoints.Targets.GetItems)
  public async getItems(
    @Param('category') categoryId: string,
    @Param('sub_category') subCategoryId: string,
  ): Promise<InternalEndpointResponse<ShopModel.Endpoints.GetItems>> {
    return await this.service.getItems(categoryId, subCategoryId);
  }

  @Post(ShopModel.Endpoints.Targets.BuyItem)
  public async buyItem(
    @HttpCtx() { user }: HTTPContext<true>,
    @Param('item_id') itemId: string,
  ): Promise<InternalEndpointResponse<ShopModel.Endpoints.BuyItem>> {
    return await this.service.buyItem(user, itemId);
  }
}
