import { Injectable } from '@nestjs/common';
import API from '@typings/api';

@Injectable()
export class AppService {
  getHello(): API.Response<{ message: string }> {
    return { status: 'ok', data: { message: 'Hello World!' } };
  }
}
