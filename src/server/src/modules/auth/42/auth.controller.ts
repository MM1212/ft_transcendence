import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext, Response } from 'typings/http';
import * as API from '@typings/api';
import { ConfigService } from '@nestjs/config';

@Controller('auth/42')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly config: ConfigService<ImportMetaEnv>,
  ) {}

  @Get('login')
  login(@HttpCtx() ctx: HTTPContext): Response {
    const { req, res, user } = ctx;
    const userData = req.session.get('user');
    if (
      userData &&
      userData.loggedIn &&
      user?.useSession(req.session).auth.isTokenValid()
    )
      res.redirect(302, `${this.config.get<string>('FRONTEND_URL')}`);
    else this.service.login(ctx);
    return res;
  }
  @Get('logout')
  logout(@HttpCtx() ctx: HTTPContext): API.EmptyResponse {
    ctx.session.delete();
    ctx.session.touch();
    return API.buildOkResponse(undefined);
  }
  @Get('callback')
  callback(@HttpCtx() ctx: HTTPContext) {
    return this.service.callback(ctx);
  }
}
