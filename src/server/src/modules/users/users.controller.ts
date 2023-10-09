import { Body, Controller, Get, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import API from '@typings/api';
import { IUser } from '@typings/user';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import { Auth } from '@/modules/auth/decorators';

export class UpdateUser implements Pick<IUser, 'avatar' | 'nickname'> {
	avatar: string;
	nickname: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Auth()
  @Get('me')
  async me(
    @HttpCtx() ctx: HTTPContext<true>,
  ): Promise<API.Response<IUser> | undefined> {
    const { user } = ctx;
    if (!user.auth.isTokenValid()) {
      user.logout();
      return API.buildErrorResponse('Invalid token');
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
