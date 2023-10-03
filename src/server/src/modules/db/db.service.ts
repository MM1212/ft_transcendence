import { Injectable } from '@nestjs/common';
import { Users } from './controllers';

@Injectable()
export class DbService {
  constructor(
    public readonly users: Users,
  ) {}
}
