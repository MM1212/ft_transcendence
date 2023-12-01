import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { Auth } from '@/modules/auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import { AuthModel, InternalEndpointResponse } from '@typings/api';

@Controller()
export class SessionController {
  @Auth()
  @Get(AuthModel.Endpoints.Targets.Session)
  async me(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<AuthModel.Endpoints.Session>> {
    const { user } = ctx;
    if (user.session.dummy) return user.publicSession;
    if (!user.session.auth.isTokenValid()) {
      user.session.logout();
      throw new UnauthorizedException();
    }
    return user.publicSession;
  }
}
