import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpRedirectResponse,
  Param,
  ParseIntPipe,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from 'typings/http';
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
      (userData.dummy || user?.useSession(req.session).auth.isTokenValid())
    ) {
      return { url: `${this.config.get<string>('FRONTEND_URL')}` };
    }
    return this.service.login(ctx);
  }
  @Get('logout')
  logout(@HttpCtx() ctx: HTTPContext) {
    ctx.session.delete();
    ctx.session.touch();
  }
  @Get('callback')
  @Redirect(undefined, 302)
  callback(@HttpCtx() ctx: HTTPContext) {
    return this.service.callback(ctx);
  }

  @Get('dummy/:dummyId')
  @Redirect(undefined, 302)
  async dummy(
    @HttpCtx() ctx: HTTPContext,
    @Param('dummyId', new DefaultValuePipe(-1), ParseIntPipe) dummyId: number,
  ) {
    return await this.service.dummy(ctx, dummyId);
  }
}
