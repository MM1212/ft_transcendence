import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import ConfigService, { ConfigServiceClass } from '@/modules/config';
import secureSessionModule from '@fastify/secure-session';
import cookiesModule from '@fastify/cookie';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppService } from './app.service';
import setupLogger from './helpers/logger';
const fastifyPrintRoutes = import('fastify-print-routes');


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: setupLogger(),
    }),
  );
  const configService = app.get<ConfigService>(ConfigServiceClass);
  // CORS

  const corsOrigins = configService
    .get<string>('BACKEND_CORS_ORIGIN')!
    .split(',');

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });
  // Cookies

  await app.register(cookiesModule, {
    secret: configService.get<string>('BACKEND_SESSION_SECRET')!,
  });

  // Session
  await app.register(secureSessionModule, {
    secret: configService.get<string>('BACKEND_SESSION_SECRET')!,
    salt: configService.get<string>('BACKEND_SESSION_SALT')!,
    cookie: {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      domain: configService.get<string>('DOMAIN'),
    },
  });

  // Websockets

  app.useWebSocketAdapter(new IoAdapter(app));

  const host = {
    ip: configService.get<string>('BIND_IP')!,
    port: configService.get<number>('BACKEND_PORT')!,
  };

  app.get(AppService).setApp(app);

  app.setGlobalPrefix('/api');
  await app.register((await fastifyPrintRoutes) as any)
  await app.listen(host.port, host.ip);
}
bootstrap();
