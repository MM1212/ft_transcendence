import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@/helpers/User';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from 'typings/http';
import API from '@typings/api';

@Controller('auth/42')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('login')
  login(@HttpCtx() ctx: HTTPContext): void {
    const { req, res } = ctx;
    const user = req.session.get('user');
    if (user && user.loggedIn && new User(req.session).auth.isTokenValid())
      res.status(302).redirect('/');
    else this.service.login(ctx);
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