import { Module, ModuleMetadata, forwardRef } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseModule } from './modules/sse/sse.module';
import { PrismaModule } from './modules/db/prisma/prisma.module';
import { DbModule } from './modules/db/db.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalFilter } from './filters/GlobalFilter';
import { LobbyModule } from './modules/lobby/lobby.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { Auth42Module } from './modules/auth/42/auth.module';
import { AuthSessionModule } from './modules/auth/session/session.module';
import { UsersModule } from './modules/users/users.module';
import { ChatsModule } from './modules/chats/chats.module';
import { IS_PROD } from './helpers/constants';
import { PongModule } from './modules/pong/pong.module';

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
    IS_PROD
      ? ServeStaticModule.forRoot({
          rootPath: path.join(__dirname, '..', '..', 'public'),
          exclude: ['/api/(.*)', 'socket.io(.*)'],
        })
      : null,
    Auth42Module,
    AuthSessionModule,
    SseModule,
    UsersModule,
    PrismaModule,
    DbModule,
    forwardRef(() => LobbyModule),
    UsersModule,
    ChatsModule,
    forwardRef(() => PongModule),
  ].filter(Boolean) as ModuleMetadata['imports'],
  providers: [AppService, { provide: APP_FILTER, useClass: GlobalFilter }],
  exports: [AppService],
})
export class AppModule {}
