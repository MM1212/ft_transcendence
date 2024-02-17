import { Global, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { DbModule } from '../db';
import { UserDependencies } from './user/dependencies';
import { UsersController } from './controllers/users.controller';
import { SseModule } from '../sse/sse.module';
import { UsersFriendsController } from './controllers/friends.controller';
import { UsersInventoryController } from './controllers/inventory.controller';
import { UsersNotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { UsersFriendsService } from './services/friends.service';
import { AchievementsModule } from '../achievements/achievements.module';
import { UserAchievementsService } from './services/achievements.service';
import { UsersAchievementsController } from './controllers/achievements.controller';
import { QuestsModule } from '../quests/quests.module';

@Global()
@Module({
  imports: [DbModule, SseModule, AchievementsModule, QuestsModule],
  providers: [UsersService, UserDependencies, NotificationsService, UsersFriendsService, UserAchievementsService],
  controllers: [
    UsersController,
    UsersFriendsController,
    UsersInventoryController,
    UsersNotificationsController,
    UsersAchievementsController,
  ],
  exports: [UsersService],
})
export class UsersModule {}
