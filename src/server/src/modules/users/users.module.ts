import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DbModule } from '../db';
import { Auth42Module } from '../auth/42/auth.module';

@Module({
  imports: [DbModule, Auth42Module],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
