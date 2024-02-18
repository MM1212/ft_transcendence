import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators';
import { AchievementsService } from './achievements.service';
import AchievementsModel from '@typings/models/users/achievements';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import type { InternalEndpointResponse } from '@typings/api';

@Auth()
@Controller()
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get(AchievementsModel.Endpoints.Targets.GetAchievements)
  public async getLeaderboard(): Promise<
    InternalEndpointResponse<AchievementsModel.Endpoints.GetAchievements>
  > {
    return this.service.getAll();
  }
}
