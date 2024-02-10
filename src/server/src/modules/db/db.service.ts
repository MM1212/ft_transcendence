import { Injectable } from '@nestjs/common';
import { Users } from './controllers';
import { Chats } from './controllers/chat';
import { Games } from './controllers/games';
import { LeaderboardDbController } from './controllers/leaderboard';

@Injectable()
export class DbService {
  constructor(
    public readonly users: Users,
    public readonly chats: Chats,
    public readonly games: Games,
    public readonly leaderboard: LeaderboardDbController
  ) {}
}
