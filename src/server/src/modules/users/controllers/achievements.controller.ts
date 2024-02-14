import HttpCtx from "@/helpers/decorators/httpCtx";
import { Auth } from "@/modules/auth/decorators/index";
import { Users } from "@/modules/db/controllers/index";
import { Controller, DefaultValuePipe, Get, ParseBoolPipe, Query } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { Quest } from "../user/ext/Quests";
import { InternalEndpointResponse } from "@typings/api/index";
import { HTTPContext } from "@typings/http";
import AchievementsModel from "@typings/models/users/achievements/index";
import QuestsModel from "@typings/models/users/quests/index";
import UserCtx from "../decorators/User.pipe";
import { UserAchievementsService } from "../services/achievements.service";
import User from "../user/index";

@Auth()
@Controller()
export class UsersAchievementsController {
    constructor(private readonly service: UserAchievementsService) {}

    @Get(AchievementsModel.Endpoints.Targets.GetUserAchievements)
    public async getUserAchievements(
        @UserCtx("userId") user: User,
        @Query("all", new DefaultValuePipe(false), new ParseBoolPipe()) all: boolean,
    ): Promise<InternalEndpointResponse<AchievementsModel.Endpoints.GetUserAchievements>> {
        return this.service.getUserAchievements(user, all);
    }

    @Get(AchievementsModel.Endpoints.Targets.GetSessionAchievements)
    public async getSessionAchievements(
        @HttpCtx(){ user }: HTTPContext < true >,
        @Query("all", new DefaultValuePipe(false), new ParseBoolPipe()) all: boolean,
    ): Promise<InternalEndpointResponse<AchievementsModel.Endpoints.GetUserAchievements>> {
        return this.service.getUserAchievements(user, all);
    }

    @OnEvent("user.quests.completed")
    public async onQuestCompleted(user: User, quest: Quest): Promise<void> {
        await this.service.onQuestCompleted(user, quest);
    }

}