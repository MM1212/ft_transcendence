import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DbModule } from '../db';

@Module({
	imports: [DbModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
