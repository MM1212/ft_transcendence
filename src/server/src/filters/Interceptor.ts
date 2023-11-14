import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { buildOkResponse } from '@typings/api';
import { Response } from '@typings/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class APIInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const resp = context.switchToHttp().getResponse<Response>();
        if (resp.statusCode >= 400 || resp.statusCode < 300)
          return buildOkResponse(data);
      }),
    );
  }
}
