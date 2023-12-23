import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { OnEvent } from '@nestjs/event-emitter';
import User from '../user';

@Injectable()
export class NotificationsService {
  constructor(private readonly usersService: UsersService) {}

  @OnEvent('user.connected')
  private onUserConnection(user: User) {}
}
