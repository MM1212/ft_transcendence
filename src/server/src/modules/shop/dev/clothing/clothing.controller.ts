import { Controller, Get } from '@nestjs/common';
import { DevClothingListService } from './clothing.service';

@Controller('/dev')
export class DevClothingListController {
  constructor(private readonly service: DevClothingListService) {}

  @Get('/clothing')
  public getList() {
    return this.service.getList();
  }
}
