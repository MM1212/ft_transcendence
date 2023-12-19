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
import { HttpError } from '@/helpers/decorators/httpError';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userData = request.session.get('user');
    
    if (!userData?.loggedIn) throw new UnauthorizedException("Not logged in");
    try {
      const user = await this.usersService.get(userData.id);
      if (!user) throw new UnauthorizedException("Unknown User");
      if (userData.dummy) return true;
      const uSession = user.useSession(request.session);
      if (!uSession.auth.isTokenValid()) await this.refreshToken(uSession);
    } catch (e) {
      console.error(e);
      if (e instanceof UnauthorizedException)
        throw e;
      throw new Error(e.message);
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
      throw new HttpError(`Failed to refresh token: ${resp.errorMsg}`);
    }
    user.auth.updateNewToken(resp.data);
  }
}
