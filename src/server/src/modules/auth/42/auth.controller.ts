import { Controller, Get, HttpRedirectResponse, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from 'typings/http';
import * as API from '@typings/api';
import { ConfigService } from '@nestjs/config';

@Controller('auth/42')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly config: ConfigService<ImportMetaEnv>,
  ) {}

  @Get('login')
  @Redirect(undefined, 302)
  login(@HttpCtx() ctx: HTTPContext): Partial<HttpRedirectResponse> {
    const { req, user } = ctx;
    const userData = req.session.get('user');
    if (
      userData &&
      userData.loggedIn &&
      user?.useSession(req.session).auth.isTokenValid()
    ) {
      return {url: `${this.config.get<string>('FRONTEND_URL')}`};
    }
    return this.service.login(ctx);
  }
  @Get('logout')
  logout(@HttpCtx() ctx: HTTPContext): API.EmptyResponse {
    ctx.session.delete();
    ctx.session.touch();
    return API.buildOkResponse(undefined);
  }
  @Get('callback')
  @Redirect(undefined, 302)
  callback(@HttpCtx() ctx: HTTPContext) {
    return this.service.callback(ctx);
  }
}
