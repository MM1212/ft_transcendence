import { DbService } from '@/modules/db';
import { SseService } from '@/modules/sse/sse.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserDependencies {
  @Inject(DbService) readonly db: DbService;
  @Inject(SseService) readonly sseService: SseService;
}
