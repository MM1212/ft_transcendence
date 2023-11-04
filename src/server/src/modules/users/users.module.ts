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
})
export class UsersModule {}
