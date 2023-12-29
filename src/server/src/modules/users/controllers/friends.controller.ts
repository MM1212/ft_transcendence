import HttpCtx from '@/helpers/decorators/httpCtx';
import { Auth } from '@/modules/auth/decorators';
import UserCtx from '@/modules/users/decorators/User.pipe';
import { UsersService } from '@/modules/users/services/users.service';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { InternalEndpointResponse } from '@typings/api';
import { HTTPContext } from '@typings/http';
import UsersModel from '@typings/models/users';
import User from '../user';

@Auth()
@Controller()
export class UsersFriendsController {
  constructor(private readonly usersService: UsersService) {}

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
