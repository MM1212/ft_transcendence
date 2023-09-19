import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Test } from '@typings/test';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<ImportMetaEnv>>(ConfigService);
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });
  const host = {
    ip: configService.get<string>('BIND_IP')!,
    port: configService.get<number>('BACKEND_PORT')!,
  };
  await app.listen(host.port, host.ip, () =>
    console.log(`Listening on ${host.ip}:${host.port}`),
  );
}
bootstrap();
