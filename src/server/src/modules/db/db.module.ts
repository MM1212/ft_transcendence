import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { Users } from './controllers';
import { PrismaModule } from './prisma';
import { Chats } from './controllers/chat';

@Module({
  imports: [PrismaModule],
  providers: [DbService, Users, Chats],
  exports: [DbService],
})
export class DbModule {}
