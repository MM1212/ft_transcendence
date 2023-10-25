import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
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
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<EndpointResponse<UsersModel.Endpoints.GetUsers>> {
    const users = await this.usersService.search(query, { limit, offset });
    return buildOkResponse(users);
  }

  @Auth()
  @Patch(UsersModel.Endpoints.Targets.PatchUser)
  async patch(
    @Param('id', ParseIntPipe, ValidationPipe) id: number,
    @Body() { avatar, nickname }: UsersModel.DTO.PatchUser,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<EndpointResponse<UsersModel.Endpoints.PatchUser>> {
    if (user.id !== id) throw new ForbiddenException();
    const ok = await user.save({ avatar, nickname });
    if (!ok) return buildErrorResponse('Failed to update profile');
    return buildOkResponse(user.public);
  }
}
