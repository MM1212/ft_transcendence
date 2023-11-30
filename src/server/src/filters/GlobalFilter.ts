import { HttpError } from '@/helpers/decorators/httpError';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as API from '@typings/api';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    try {
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const responseBody: API.ResponseError = {
        status: 'error',
        errorMsg: `${exception instanceof HttpError ? '' : httpStatus} ${
          exception instanceof Error ? exception.message : 'Unknown error'
        }`,
      };
      if (exception instanceof Error && exception.message)
        responseBody.errorMsg = exception.message;
      if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR)
        console.error(exception);

      // console.log({ exception, httpStatus, responseBody });
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } catch (e) {
      console.error(e);
      httpAdapter.reply(
        ctx.getResponse(),
        API.buildErrorResponse(e.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
