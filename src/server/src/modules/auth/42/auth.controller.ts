import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@/helpers/User';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext, Response } from 'typings/http';
import API from '@typings/api';
import { ConfigService } from '@nestjs/config';

@Controller('auth/42')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly config: ConfigService<ImportMetaEnv>,
  ) {}

  @Get('login')
  login(@HttpCtx() ctx: HTTPContext): Response {
    const { req, res } = ctx;
    const user = req.session.get('user');
    if (user && user.loggedIn && new User(req.session).auth.isTokenValid())
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
