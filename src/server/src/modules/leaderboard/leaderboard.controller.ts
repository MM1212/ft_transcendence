import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators';
import { LeaderboardService } from './leaderboard.service';
import LeaderboardModel from '@typings/models/leaderboard';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import type { InternalEndpointResponse } from '@typings/api';

@Auth()
@Controller()
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get(LeaderboardModel.Endpoints.Targets.GetLeaderboard)
  public async getLeaderboard(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('include_self', new DefaultValuePipe(true), ParseBoolPipe)
    includeSelf: boolean,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<
    InternalEndpointResponse<LeaderboardModel.Endpoints.GetLeaderboard>
  > {
    const leaderboard = await this.service.getLeaderboard(limit, offset);
    if (
      includeSelf &&
      user.elo.gamesPlayed > 0 &&
      leaderboard.every((entry) => entry.userId !== user.id)
    ) {
      const entry: LeaderboardModel.DTO.Leaderboard = {
        ...user.elo.leaderboard,
      };
      entry.position = this.service.getPositionForUser(user.id);
      if (entry.position === -1) delete entry.position;
      const toInsertSortedIdx = leaderboard.findIndex(
        (entry) => entry.elo <= user.elo.rating,
      );
      if (toInsertSortedIdx === -1) leaderboard.push(entry);
      else leaderboard.splice(toInsertSortedIdx, 0, entry);
    }
    return leaderboard;
  }
}
