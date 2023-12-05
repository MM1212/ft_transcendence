import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { Users } from './controllers';
import { PrismaModule } from './prisma';
import { Chats } from './controllers/chat';
import { Games } from './controllers/games';

@Module({
  imports: [PrismaModule],
  providers: [DbService, Users, Chats, Games],
  exports: [DbService],
})
export class DbModule {}
