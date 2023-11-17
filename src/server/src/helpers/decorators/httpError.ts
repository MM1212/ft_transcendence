import { HttpException, HttpStatus } from '@nestjs/common';

export class HttpError extends HttpException {
  constructor(
    message: string = 'Internal server error',
    statusCode: number = HttpStatus.OK,
  ) {
    super(message, statusCode);
  }
}
