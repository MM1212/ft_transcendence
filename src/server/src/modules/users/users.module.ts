import { Global, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { DbModule } from '../db';
import { UserDependencies } from './user/dependencies';
import { UsersController } from './controllers/users.controller';
import { SseModule } from '../sse/sse.module';
import { UsersFriendsController } from './controllers/friends.controller';
import { UsersInventoryController } from './controllers/inventory.controller';
import { UsersNotificationsController } from './controllers/notifications.controller';

@Global()
@Module({
  imports: [DbModule, SseModule],
  providers: [UsersService, UserDependencies],
  controllers: [
    UsersController,
    UsersFriendsController,
    UsersInventoryController,
    UsersNotificationsController
  ],
  exports: [UsersService],
})
export class UsersModule {}
