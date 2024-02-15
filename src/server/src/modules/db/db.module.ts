import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { Users } from './controllers';
import { PrismaModule } from './prisma';
import { Chats } from './controllers/chat';
import { Games } from './controllers/games';
import { UserQuests } from './controllers/users/quests';
import { UserInventory } from './controllers/users/inventory';
import { UserNotifications } from './controllers/users/notifications';
import { Pong } from './controllers/games/pong';
import { PongHistory } from './controllers/games/pong/history';
import { LeaderboardDbController } from './controllers/leaderboard';

@Module({
  imports: [PrismaModule],
  providers: [
    DbService,
    Users,
    UserQuests,
    UserInventory,
    UserNotifications,
    Chats,
    Games,
    Pong,
    PongHistory,
    LeaderboardDbController
  ],
  exports: [DbService],
})
export class DbModule {}
