import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@typings/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.session.get('user')?.loggedIn)
      throw new UnauthorizedException();
    return true;
  }
}

export function Auth() {
  return applyDecorators(UseGuards(AuthGuard));
}
