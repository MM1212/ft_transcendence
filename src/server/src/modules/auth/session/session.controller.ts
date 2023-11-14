import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { Auth } from '@/modules/auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import * as API from '@typings/api';

@Controller()
export class SessionController {
  constructor() {}

  @Auth()
  @Get(API.AuthModel.Endpoints.Targets.Session)
  async me(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<API.InternalEndpointResponse<API.AuthModel.Endpoints.Session>> {
    const { user } = ctx;
    if (!user.session.auth.isTokenValid()) {
      user.session.logout();
      throw new UnauthorizedException();
    }
    return user.public;
  }
}
