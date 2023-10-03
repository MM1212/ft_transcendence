import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type API from '@typings/api';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/test')
  getHello(): API.Response<{ message: string }> {
    return this.appService.getHello();
  }
}
