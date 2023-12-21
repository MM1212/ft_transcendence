import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbModule } from '../db';
import { UserDependencies } from './user/dependencies';
import { UsersController } from './controllers/users.controller';
import { SseModule } from '../sse/sse.module';
import { UsersFriendsController } from './controllers/friends.controller';
import { UsersInventoryController } from './controllers/inventory.controller';

@Global()
@Module({
  imports: [DbModule, SseModule],
  providers: [UsersService, UserDependencies],
  controllers: [
    UsersController,
    UsersFriendsController,
    UsersInventoryController,
  ],
  exports: [UsersService],
})
export class UsersModule {}
