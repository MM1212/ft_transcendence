import { User } from '@/helpers/User';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth } from '@typings/auth';
import { Request } from '@typings/http';
import { AuthService } from '../42/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<ImportMetaEnv>,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = new User(request.session);

    if (!user.loggedIn) throw new UnauthorizedException();
    try {
      if (!user.auth.isTokenValid()) await this.refreshToken(user);
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }
  private async refreshToken(user: User): Promise<void> {
    const resp = await this.authService.requestToken<Auth.RefreshToken>(
      user,
      'refresh',
      { refreshToken: user.auth.refreshToken },
    );
    if (resp.status !== 'ok') {
      user.logout();
      throw new Error('Failed to refresh token');
    }
    user.auth.updateNewToken(resp.data);
  }
}
