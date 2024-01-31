import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { InternalEndpointResponse } from '@typings/api';
import UsersModel from '@typings/models/users';
import { Auth } from '../../auth/decorators';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import UserCtx from '../decorators/User.pipe';
import User from '../user';
import { ObjectValidationPipe } from '@/helpers/decorators/validator';
import usersValidator from '../users.validator';

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
    @Body(new ObjectValidationPipe(usersValidator.patchUserSchema))
    { avatar, nickname, status, firstLogin }: UsersModel.DTO.PatchUser,
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

  @Get(UsersModel.Endpoints.Targets.GetCredits)
  async getCredits(@UserCtx() user: User) {
    return user.credits;
  }
}
