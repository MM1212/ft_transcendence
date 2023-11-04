import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Auth } from '@typings/auth';
import { Request } from '@typings/http';
import { AuthService } from '../42/auth.service';
import { UsersService } from '@/modules/users/users.service';
import UserExtSession from '@/modules/users/user/ext/Session';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userData = request.session.get('user');

    if (!userData?.loggedIn) throw new UnauthorizedException();
    try {
      const user = await this.usersService.get(userData.id);
      if (!user) throw new UnauthorizedException();
      const uSession = user.useSession(request.session);
      if (!uSession.auth.isTokenValid()) await this.refreshToken(uSession);
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }
  private async refreshToken(user: UserExtSession): Promise<void> {
    const resp = await this.authService.requestToken<Auth.RefreshToken>(
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
