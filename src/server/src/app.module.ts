import { Module, forwardRef } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/42/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseModule } from './modules/sse/sse.module';
import { PrismaModule } from './modules/db/prisma/prisma.module';
import { DbModule } from './modules/db/db.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalFilter } from './filters/GlobalFilter';
import { LobbyModule } from './modules/lobby/lobby.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      cache: true,
      envFilePath: [`.env.local`, `.env`],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      global: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'static'),
      serveRoot: '/static'
    }),
    AuthModule,
    UsersModule,
    SseModule,
    PrismaModule,
    DbModule,
    forwardRef(() => LobbyModule),
  ],
  providers: [AppService, { provide: APP_FILTER, useClass: GlobalFilter }],
  exports: [AppService],
})
export class AppModule {}
