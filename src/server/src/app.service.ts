import { Injectable } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

@Injectable()
export class AppService {
  public app: NestFastifyApplication;
  setApp(app: NestFastifyApplication) {
    this.app = app;
  }
}
