import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { Users } from './controllers';
import { PrismaModule } from './prisma';
import { Chats } from './controllers/chat';
import { Games } from './controllers/games';
import { UserQuests } from './controllers/users/quests';

@Module({
  imports: [PrismaModule],
  providers: [DbService, Users, UserQuests, Chats, Games],
  exports: [DbService],
})
export class DbModule {}
