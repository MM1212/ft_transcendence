<<<<<<< HEAD
import { Body, Controller, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import * as API from '@typings/api';
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
=======
import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  EndpointResponse,
  buildErrorResponse,
  buildOkResponse,
} from '@typings/api';
import UsersModel from '@typings/models/users';
import { Auth } from '../auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(UsersModel.Endpoints.Targets.GetUsers)
  @Auth()
  async getAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<EndpointResponse<UsersModel.Endpoints.GetUsers>> {
    const users = await this.usersService.getAll({ limit, offset });
    return buildOkResponse(users);
  }

  @Auth()
  @Get(UsersModel.Endpoints.Targets.GetUser)
  async get(@Param('id', ParseIntPipe, ValidationPipe) id: number) {
    const user = await this.usersService.get(id);
    if (!user) return buildErrorResponse('User not found');
    return buildOkResponse(user?.public);
  }

  @Auth()
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
  ): Promise<EndpointResponse<UsersModel.Endpoints.GetUsers>> {
    const users = await this.usersService.search(query, { limit, offset });
    return buildOkResponse(
      users.filter((u) => {
        if (exclude.includes(u.id)) return false;
        if (excludeSelf && u.id === user.id) return false;
        return true;
      }),
    );
  }

  @Auth()
  @Patch(UsersModel.Endpoints.Targets.PatchUser)
  async patch(
    @Param('id', ParseIntPipe, ValidationPipe) id: number,
    @Body() { avatar, nickname }: UsersModel.DTO.PatchUser,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<EndpointResponse<UsersModel.Endpoints.PatchUser>> {
    if (user.id !== id) throw new ForbiddenException();
    const ok = await user.save({ avatar, nickname }, true);
    if (!ok) return buildErrorResponse('Failed to update profile');
    return buildOkResponse(user.public);
>>>>>>> origin/dev
  }
}
