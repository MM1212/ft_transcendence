import { Auth } from '@/modules/auth/decorators/index';
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  Query,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { Quest } from '../user/ext/Quests';
import { InternalEndpointResponse } from '@typings/api/index';
import AchievementsModel from '@typings/models/users/achievements/index';
import UserCtx from '../decorators/User.pipe';
import { UserAchievementsService } from '../services/achievements.service';
import User from '../user/index';
import { AchievementsService } from '@/modules/achievements/achievements.service';
import type QuestsModel from '@typings/models/users/quests';

@Auth()
@Controller()
export class UsersAchievementsController {
  constructor(
    private readonly service: UserAchievementsService,
    private readonly configService: AchievementsService,
  ) {}

  @Get(AchievementsModel.Endpoints.Targets.GetUserAchievements)
  public async getUserAchievements(
    @UserCtx('userId') user: User,
    @Query('all', new DefaultValuePipe(false), new ParseBoolPipe())
    all: boolean,
  ): Promise<
    InternalEndpointResponse<AchievementsModel.Endpoints.GetUserAchievements>
  > {
    const achievements = this.service.getUserAchievements(user, all);
    return { achievements, total: this.configService.getSize() };
  }

  @OnEvent('user.quests.next')
  public async onQuestNewMilestone(
    user: User,
    quest: Quest,
    milestonePassed: QuestsModel.Models.IQuestMilestone,
  ): Promise<void> {
    await this.service.onQuestNewMilestone(user, quest, milestonePassed);
  }
}
