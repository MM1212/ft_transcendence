import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators';
import { PongHistoryService } from './history.service';
import PongHistoryModel from '@typings/models/pong/history';
import UserCtx from '../users/decorators/User.pipe';
import User from '../users/user';
import { InternalEndpointResponse } from '@typings/api';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';

@Auth()
@Controller()
export class PongHistoryController {
  constructor(private readonly service: PongHistoryService) {}

  @Get(PongHistoryModel.Endpoints.Targets.GetAllByUserId)
  async getAll(
    @UserCtx() user: User,
    @Query('skip', new DefaultValuePipe(0), new ParseIntPipe()) skip: number,
    @Query('take', new DefaultValuePipe(10), new ParseIntPipe()) take: number,
    @Query(
      'cursor',
      new DefaultValuePipe(undefined),
      new ParseIntPipe({ optional: true }),
    )
    cursor?: number,
  ): Promise<
    InternalEndpointResponse<PongHistoryModel.Endpoints.GetAllByUserId>
  > {
    return this.service.getAll(user, {
      skip,
      take,
      cursor,
    });
  }

  @Get(PongHistoryModel.Endpoints.Targets.GetAllBySession)
  async getAllBySession(
    @HttpCtx() { user }: HTTPContext<true>,
    @Query('skip', new DefaultValuePipe(0), new ParseIntPipe()) skip: number,
    @Query('take', new DefaultValuePipe(10), new ParseIntPipe()) take: number,
    @Query('cursor', new DefaultValuePipe(undefined), new ParseIntPipe({optional: true}))
    cursor?: number,
  ): Promise<
    InternalEndpointResponse<PongHistoryModel.Endpoints.GetAllBySession>
  > {
    return this.service.getAll(user, {
      skip,
      take,
      cursor,
    });
  }
}
