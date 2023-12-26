import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import User from '../user';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('user.connected')
  private onUserConnection(user: User) {
    user.notifications.cleanup(true);
  }

  public async handleNotificationAction(
    user: User,
    nId: number,
    action: string,
  ): Promise<void> {
    const notification = user.notifications.get(nId);
    if (!notification) throw new NotFoundException('Notification not found');
    if (action === '__dismiss') {
      if (!(await notification.dismiss(true)))
        throw new ForbiddenException('Cannot dismiss notification');
      return;
    }
    await this.eventEmitter.emitAsync(
      `user.notifications[${notification.tag}].action`,
      user,
      notification,
      action,
    );
  }
}
