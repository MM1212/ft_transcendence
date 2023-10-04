import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { Users } from './controllers';
import { PrismaModule } from './prisma';

@Module({
  imports: [PrismaModule],
  providers: [DbService, Users],
  exports: [DbService],
})
export class DbModule {}
