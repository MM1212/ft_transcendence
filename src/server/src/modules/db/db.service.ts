import { Injectable } from '@nestjs/common';
import { Users } from './controllers';
import { Chats } from './controllers/chat';
import { Games } from './controllers/games';

@Injectable()
export class DbService {
  constructor(
    public readonly users: Users,
    public readonly chats: Chats,
    public readonly games: Games,
  ) {}
}
