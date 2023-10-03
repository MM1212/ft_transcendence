import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from '@typings/http';
import { Observable } from 'rxjs';

export const OnConnectionClosed = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    new Observable((observer) => {
      const request = ctx.switchToHttp().getRequest<Request>();
      request.socket.on('close', () => observer.complete());
    }),
);
