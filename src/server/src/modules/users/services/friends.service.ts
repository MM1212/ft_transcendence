import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Notification } from '../user/ext/Notifications';
import NotificationsModel from '@typings/models/notifications';
import UsersModel from '@typings/models/users';
import User from '../user';
import UserProfileMessageInjector from '../user/ext/Notifications/MessageInjectors/UserProfile';

@Injectable()
export class UsersFriendsService {
  constructor(private readonly service: UsersService) {}

  private async deleteFriendRequest(user: User, target: User): Promise<void> {
    const notifs = [
      ...user.notifications.getByTag(
        NotificationsModel.Models.Tags.UserFriendsRequest,
      ),
      ...target.notifications.getByTag(
        NotificationsModel.Models.Tags.UserFriendsRequest,
      ),
    ];
    WeakRef;
    await Promise.all(notifs.map((notif) => notif.delete(true)));
  }
  @OnEvent('user.notifications.delete')
  private async onFriendRequestDelete(notif: Notification): Promise<void> {
    if (notif.tag !== NotificationsModel.Models.Tags.UserFriendsRequest) return;
    const { uId } =
      notif.dataAs<UsersModel.DTO.FriendRequestNotification['data']>();
    const target = await this.service.get(uId);
    if (!target) return;
    await this.deleteFriendRequest(notif.user, target);
  }

  @OnEvent(
    `user.notifications[${NotificationsModel.Models.Tags.UserFriendsRequest}].action`,
  )
  private async onFriendRequestAction(
    user: User,
    notif: Notification,
    action: string,
  ): Promise<void> {
    const { uId } =
      notif.dataAs<UsersModel.DTO.FriendRequestNotification['data']>();
    const target = await this.service.get(uId);
    if (!target) return;
    const [targetNotif] = target.notifications.getByTag(
      NotificationsModel.Models.Tags.UserFriendsRequest,
    );
    if (!targetNotif) return;
    const notifs = [notif, targetNotif];
    switch (action) {
      case 'cancel':
      case 'reject': {
        await user.alerts.send(
          'success',
          'Friend Request',
          `${action === 'cancel' ? 'Canceled' : 'Rejected'} friend request`,
        );
        await Promise.all(notifs.map((notif) => notif.delete(true)));
        break;
      }
      case 'accept': {
        await target.friends.acceptFriendRequest(user);
        await user.alerts.send(
          'success',
          'Friend Request',
          'Accepted friend request',
        );
        notif.message = `${new UserProfileMessageInjector(
          target,
          (l) => `${l}'s`,
        )} request accepted`;
        targetNotif.message = `${new UserProfileMessageInjector(
          user,
        )} accepted your friend request`;
        await Promise.all(
          notifs.map(async (notif) => {
            await notif.updateData<
              UsersModel.DTO.FriendRequestNotification['data']
            >(
              (prev) => ({
                ...prev,
                status: 'accepted',
              }),
              false,
            );
            notif.dismissable = true;
            await notif.markAsUnread(false);
            await notif.save('message', 'dismissable');
            notif.sync('dismissable', 'data', 'read', 'message');
          }),
        );
        break;
      }
    }
  }
}
