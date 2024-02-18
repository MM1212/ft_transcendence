import { DbService } from '@/modules/db';
import { SseService } from '@/modules/sse/sse.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AchievementsService } from '@/modules/achievements/achievements.service';

@Injectable()
export class UserDependencies {
  @Inject(forwardRef(() => UsersService)) readonly usersService: UsersService;
  @Inject(DbService) readonly db: DbService;
  @Inject(SseService) readonly sseService: SseService;
  @Inject(EventEmitter2) readonly events: EventEmitter2;
  @Inject(AchievementsService)
  readonly achievementsService: AchievementsService;
}
