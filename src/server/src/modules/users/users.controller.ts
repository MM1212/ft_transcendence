import { Body, Controller, Get, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import API, { Endpoints } from '@typings/api';
import { IUser } from '@typings/user';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import { Auth } from '@/modules/auth/guards/auth.guard';

export class UpdateUser implements Pick<IUser, 'avatar' | 'nickname'> {
	avatar: string;
	nickname: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  @Auth()
  async me(@HttpCtx() ctx: HTTPContext<true>): Promise<API.Response<IUser>> {
    const { user } = ctx;
    if (!user.auth.isTokenValid()) {
      ctx.res.redirect(Endpoints.AuthLogin);
      return API.buildErrorResponse('Token expired');
    }
    return API.buildOkResponse(user.public);
  }
  @Put('user')
  @Auth()
  async updateUser(
    @HttpCtx() ctx: HTTPContext<true>,
    @Body() user: UpdateUser,
  ): Promise<API.EmptyResponse> {
    const ok = await this.service.updateUser(ctx, user);
    return ok
      ? API.buildOkResponse(undefined)
      : API.buildErrorResponse('Failed to update avatar :(');
  }
}
