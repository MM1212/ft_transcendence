import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import API, { Endpoints } from '@typings/api';
import { IUser } from '@typings/user';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  async me(@HttpCtx() ctx: HTTPContext): Promise<API.Response<IUser>> {
    const { user } = ctx;
    if (!user) {
      ctx.res.status(401);
      return API.buildErrorResponse('Unauthorized');
    }
    if (!user.auth.isTokenValid()) {
      ctx.res.redirect(Endpoints.AuthLogin);
      return API.buildErrorResponse('Token expired');
    }
    return API.buildOkResponse(user.public);
  }
}
