import { Injectable } from '@nestjs/common';
import { Users } from './controllers';
import { Chats } from './controllers/chat';

@Injectable()
export class DbService {
  constructor(
    public readonly users: Users,
    public readonly chats: Chats,
  ) {}
}
