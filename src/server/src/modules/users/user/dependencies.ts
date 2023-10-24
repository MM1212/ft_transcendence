import { DbService } from '@/modules/db';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserDependencies {
  @Inject(DbService) readonly db: DbService;
}
