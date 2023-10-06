import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import API from '@typings/api';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: API.ResponseError = {
      status: 'error',
      errorMsg: `${httpStatus} ${
        exception instanceof Error ? exception.message : 'Unknown error'
      }`,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}