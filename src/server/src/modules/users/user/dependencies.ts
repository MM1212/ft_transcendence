import { DbService } from '@/modules/db';
import { SseService } from '@/modules/sse/sse.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UserDependencies {
  @Inject(forwardRef(() => UsersService)) readonly usersService: UsersService;
  @Inject(DbService) readonly db: DbService;
  @Inject(SseService) readonly sseService: SseService;
}
