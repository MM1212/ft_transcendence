import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InternalEndpointResponse } from '@typings/api';
import UsersModel from '@typings/models/users';
import { Auth } from '../auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import UserCtx from './decorators/User.pipe';
import User from './user';

@Auth()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(UsersModel.Endpoints.Targets.GetUsers)
  async getAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.GetUsers>> {
    const users = await this.usersService.getAll({ limit, offset });
    return users;
  }

  @Get(UsersModel.Endpoints.Targets.GetUser)
  async get(@UserCtx() user: User) {
    return user?.public;
  }

  @Post(UsersModel.Endpoints.Targets.SearchUsers)
  async search(
    @Body('query', ValidationPipe) query: string,
    @Body('exclude', new DefaultValuePipe<number[], number[]>([]))
    exclude: number[],
    @Body('excludeSelf', new DefaultValuePipe(true), ParseBoolPipe)
    excludeSelf: boolean,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.GetUsers>> {
    const users = await this.usersService.search(query, { limit, offset });
    return users.filter((u) => {
      if (exclude.includes(u.id)) return false;
      if (excludeSelf && u.id === user.id) return false;
      return true;
    });
  }

  @Patch(UsersModel.Endpoints.Targets.PatchUser)
  async patch(
    @UserCtx() target: User,
    @Body() { avatar, nickname, status, firstLogin }: UsersModel.DTO.PatchUser,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.PatchUser>> {
    if (user.id !== target.id) throw new ForbiddenException();
    const ok = await user.save({ avatar, nickname, status, firstLogin }, true);
    if (!ok)
      throw new ForbiddenException(
        'Failed to update profile: nickname is already taken',
      );
    return user.public;
  }

  @Get(UsersModel.Endpoints.Targets.GetFriends)
  async getFriends(
    @UserCtx() user: User,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.GetFriends>> {
    return user.friends.ids;
  }

  @Get(UsersModel.Endpoints.Targets.GetBlocked)
  async getBlocked(
    @UserCtx() user: User,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.GetBlocked>> {
    return user.friends.blockedIds;
  }

  @Get(UsersModel.Endpoints.Targets.GetSessionFriends)
  async getSessionFriends(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.GetFriends>> {
    return user.friends.ids;
  }

  @Get(UsersModel.Endpoints.Targets.GetSessionBlocked)
  async getSessionBlocked(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.GetBlocked>> {
    return user.friends.blockedIds;
  }

  @Put(UsersModel.Endpoints.Targets.AddFriend)
  async addFriend(
    @UserCtx() user: User,
    @Param('friendId', ParseIntPipe) friendId: number,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.AddFriend>> {
    await user.friends.add(friendId);
  }

  @Post(UsersModel.Endpoints.Targets.AddFriendByName)
  async addFriendByName(
    @UserCtx() target: User,
    @Body('nickname') nickname: string,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.AddFriendByName>> {
    if (user.id !== target.id) throw new ForbiddenException();
    await target.friends.addByName(nickname);
  }

  @Delete(UsersModel.Endpoints.Targets.RemoveFriend)
  async removeFriend(
    @UserCtx() user: User,
    @Param('friendId', ParseIntPipe) friendId: number,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.RemoveFriend>> {
    await user.friends.remove(friendId);
  }

  @Put(UsersModel.Endpoints.Targets.BlockUser)
  async blockUser(
    @UserCtx() user: User,
    @Param('blockedId', ParseIntPipe) blockedId: number,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.BlockUser>> {
    await user.friends.block(blockedId);
  }

  @Delete(UsersModel.Endpoints.Targets.UnblockUser)
  async unblockUser(
    @UserCtx() user: User,
    @Param('blockedId', ParseIntPipe) blockedId: number,
  ): Promise<InternalEndpointResponse<UsersModel.Endpoints.UnblockUser>> {
    await user.friends.unblock(blockedId);
  }
}
