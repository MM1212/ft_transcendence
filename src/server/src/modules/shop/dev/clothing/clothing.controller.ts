import { Controller, Get, Param, Put, Body, ParseIntPipe } from '@nestjs/common';
import { DevClothingListService, type ClothingItem } from './clothing.service';
import { Auth } from '@/modules/auth/decorators';

@Auth()
@Controller('/dev')
export class DevClothingListController {
  constructor(private readonly service: DevClothingListService) {}

  @Get('/clothing')
  public getList() {
    return this.service.getList();
  }

  @Put('/clothing/:id')
  public updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ClothingItem,
  ): Promise<void> {
    return this.service.updateItem(id, body);
  }
}
