import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { Auth } from '@/modules/auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import * as API from '@typings/api';

@Controller('auth/session')
export class SessionController {
  constructor() {}

  @Auth()
  @Get()
  async me(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<API.EndpointResponse<API.AuthModel.Endpoints.Session>> {
    const { user } = ctx;
    if (!user.session.auth.isTokenValid()) {
      user.session.logout();
      throw new UnauthorizedException();
    }
    return API.buildOkResponse(user.public);
  }
}
