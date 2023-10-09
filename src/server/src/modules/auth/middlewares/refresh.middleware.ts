import { User } from '@/helpers/User';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from '@typings/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Auth } from '@typings/auth';

@Injectable()
export class AuthRefreshTokenInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService<ImportMetaEnv>) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.session.get('user') || !req.session.get('user')?.loggedIn) {
      return next.handle();
    }
    const user = new User(req.session);
    if (user.auth.isTokenValid()) {
      return next.handle();
    }
    const url = new URL(this.configService.get('BACKEND_42_REDIRECT_URI')!);
    url.searchParams.append(
      'client_id',
      this.configService.get('BACKEND_42_CLIENT_ID')!,
    );
    url.searchParams.append(
      'client_secret',
      this.configService.get('BACKEND_42_SECRET')!,
    );
    url.searchParams.append('refresh_token', user.auth.refreshToken!);
    url.searchParams.append('grant_type', 'refresh_token');
    try {
      const resp = await fetch(url.toString(), {
        method: 'POST',
      });
      const data = (await resp.json()) as Auth.Token | undefined;
      if (!data) throw new Error('Invalid token');
      user.update('token', data);
    } catch (e) {
      user.logout();
    }
    return next.handle();
  }
}
