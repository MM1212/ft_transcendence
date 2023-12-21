import HttpCtx from '@/helpers/decorators/httpCtx';
import { Auth } from '@/modules/auth/decorators';
import { Controller, Get } from '@nestjs/common';
import { InternalEndpointResponse } from '@typings/api';
import { HTTPContext } from '@typings/http';
import InventoryModel from '@typings/models/users/inventory';

@Auth()
@Controller()
export class UsersInventoryController {
  constructor() {}

  @Get(InventoryModel.Endpoints.Targets.GetSessionInventory)
  async getSessionInventory(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<
    InternalEndpointResponse<InventoryModel.Endpoints.GetSessionInventory>
  > {
    return user.inventory.items;
  }
}
