import { Injectable } from '@nestjs/common';
import { DbService } from '../db';
import User from '../users/user';
import PongHistoryModel from '@typings/models/pong/history';

@Injectable()
export class PongHistoryService {
  constructor(private readonly db: DbService) {}

  async getAll(
    user: User,
    filter: {
      skip?: number;
      take?: number;
      cursor?: number;
    },
  ): Promise<PongHistoryModel.Models.Match[]> {
    return await this.db.games.pong.history.getAllFromUserId(user.id, filter);
  }

  async saveGame(match: PongHistoryModel.DTO.DB.CreateMatch): Promise<PongHistoryModel.Models.Match> {
    return await this.db.games.pong.history.create(match);
  }
}
