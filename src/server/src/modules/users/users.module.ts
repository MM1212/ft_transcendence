<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DbModule } from '../db';
import { Auth42Module } from '../auth/42/auth.module';

@Module({
  imports: [DbModule, Auth42Module],
  controllers: [UsersController],
  providers: [UsersService],
=======
import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbModule } from '../db';
import { UserDependencies } from './user/dependencies';
import { UsersController } from './users.controller';
import { SseModule } from '../sse/sse.module';

@Global()
@Module({
  imports: [DbModule, SseModule],
  providers: [UsersService, UserDependencies],
  controllers: [UsersController],
  exports: [UsersService],
>>>>>>> origin/dev
})
export class UsersModule {}
