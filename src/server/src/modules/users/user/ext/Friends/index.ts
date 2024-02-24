import UsersModel from '@typings/models/users';
import User from '../..';
import UserExtBase from '../Base';
import { HttpError } from '@/helpers/decorators/httpError';
import NotificationsModel from '@typings/models/notifications';
import UserProfileMessageInjector from '../Notifications/MessageInjectors/UserProfile';
import { Notification } from '../Notifications';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

class UserExtFriends extends UserExtBase {
  constructor(user: User) {
    super(user);
  }
  get ids(): number[] {
    return this.user.get('friends');
  }
  get blockedIds(): number[] {
    return this.user.get('blocked');
  }
  async getAll(): Promise<User[]> {
    return (
      await Promise.all(this.ids.map((id) => this.helpers.usersService.get(id)))
    ).filter(Boolean) as User[];
  }
  async getBlocked(): Promise<User[]> {
    return (
      await Promise.all(
        this.blockedIds.map((id) => this.helpers.usersService.get(id)),
      )
    ).filter(Boolean) as User[];
  }
  is(id: number): boolean {
    return this.ids.includes(id);
  }
  isBlocked(id: number): boolean {
    return this.blockedIds.includes(id);
  }
  isPending(id: number): boolean {
    const notifs = this.user.notifications.getByTag(
      NotificationsModel.Models.Tags.UserFriendsRequest,
    );
    return notifs.some((notif) => {
      const { status, uId } =
        notif.dataAs<UsersModel.DTO.FriendRequestNotification['data']>();
      return uId === id && status === 'pending';
    });
  }
  async getPendingNotifications(
    id: number,
  ): Promise<[Notification, Notification]> {
    const notifs = this.user.notifications.getByTag(
      NotificationsModel.Models.Tags.UserFriendsRequest,
    );
    const notif = notifs.find((notif) => {
      const { uId } =
        notif.dataAs<UsersModel.DTO.FriendRequestNotification['data']>();
      return uId === id;
    });
    if (!notif) throw new HttpError('Friend request not found');
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    const targetNotif = target.notifications
      .getByTag(NotificationsModel.Models.Tags.UserFriendsRequest)
      .find((notif) => {
        const { uId } =
          notif.dataAs<UsersModel.DTO.FriendRequestNotification['data']>();
        return uId === this.user.id;
      });
    if (!targetNotif) throw new HttpError('Friend request not found');
    return [notif, targetNotif];
  }
  async add(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new NotFoundException('User not found');
    if (target.isBot)
      throw new ForbiddenException('You cannot add a bot as a friend');
    if (this.user.id === target.id)
      throw new ForbiddenException('You cannot add yourself');
    if (this.is(target.id)) throw new ForbiddenException('User already added');
    if (this.isBlocked(target.id)) throw new ForbiddenException('User is blocked');
    if (target.friends.isBlocked(this.user.id))
      throw new ForbiddenException('User has blocked you');
    if (this.isPending(target.id))
      throw new ForbiddenException('Friend request already sent');
    try {
      await Promise.all(
        (await this.getPendingNotifications(target.id)).map((notif) =>
          notif.delete(true),
        ),
      );
    } catch (e) {
      /* empty */
    }

    await this.user.notifications.create({
      tag: NotificationsModel.Models.Tags.UserFriendsRequest,
      title: 'Friend request',
      message: `Friend request sent to ${new UserProfileMessageInjector(
        target,
      )}`,
      type: NotificationsModel.Models.Types.Permanent,
      data: {
        type: 'sender',
        uId: target.id,
        status: 'pending',
      },
      dismissable: false,
    });
    await target.notifications.create<
      UsersModel.DTO.FriendRequestNotification['data']
    >({
      tag: NotificationsModel.Models.Tags.UserFriendsRequest,
      title: 'Friend request',
      message: `${new UserProfileMessageInjector(
        this.user,
      )} sent you a friend request`,
      type: NotificationsModel.Models.Types.Permanent,
      data: {
        type: 'receiver',
        uId: this.user.id,
        status: 'pending',
      },
      dismissable: false,
    });
  }
  async addByName(name: string): Promise<void> {
    const target = await this.helpers.usersService.getByNickname(name);
    if (!target) throw new HttpError('User not found');
    await this.add(target.id);
  }
  public async acceptFriendRequest(target: User): Promise<void> {
    if (!target) throw new HttpError('User not found');
    await this.helpers.db.users.update(this.user.id, {
      friends: {
        connect: { id: target.id },
      },
    });
    await this.helpers.db.users.update(target.id, {
      friendOf: {
        connect: { id: this.user.id },
      },
    });
    this.user.set('friends', (prev) => [...prev, target.id]);
    target.set('friends', (prev) => [...prev, this.user.id]);
    // this.user.syncWithSessions();
    // target.syncWithSessions();
    this.propagate([{ id: target.id, type: 'add' }], []);
    target.friends.propagate([{ id: this.user.id, type: 'add' }], []);
  }
  async remove(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    if (!this.ids.includes(id)) throw new HttpError('User not a friend');
    await this.helpers.db.users.update(this.user.id, {
      friends: {
        disconnect: { id },
      },
      friendOf: {
        disconnect: { id },
      },
    });
    await this.helpers.db.users.update(id, {
      friendOf: {
        disconnect: { id: this.user.id },
      },
      friends: {
        disconnect: { id: this.user.id },
      },
    });
    this.user.set('friends', (prev) => prev.filter((i) => i !== id));
    target.set('friends', (prev) => prev.filter((i) => i !== this.user.id));
    // this.user.syncWithSessions();
    // target.syncWithSessions();
    this.propagate([{ id, type: 'remove' }], []);
    target.friends.propagate([{ id: this.user.id, type: 'remove' }], []);
  }
  async block(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    if (this.user.id === target.id)
      throw new HttpError('You cannot block yourself');
    if (this.blockedIds.includes(id))
      throw new HttpError('User already blocked');
    if (this.ids.includes(id)) await this.remove(id);
    await this.helpers.db.users.update(this.user.id, {
      blocked: {
        connect: { id },
      },
    });
    this.user.set('blocked', (prev) => [...prev, id]);
    // this.user.syncWithSessions();
    this.propagate([], [{ id, type: 'add' }]);
  }
  async unblock(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    if (!this.blockedIds.includes(id)) throw new HttpError('User not blocked');
    await this.helpers.db.users.update(this.user.id, {
      blocked: {
        disconnect: { id },
      },
    });
    this.user.set('blocked', (prev) => prev.filter((i) => i !== id));
    // this.user.syncWithSessions();
    this.propagate([], [{ id, type: 'remove' }]);
  }
  propagate(
    friends: UsersModel.DTO.SseFriendsUpdater[] = [],
    blocked: UsersModel.DTO.SseFriendsUpdater[] = [],
  ): void {
    this.helpers.sseService.emitToTargets<UsersModel.Sse.UserFriendsUpdatedEvent>(
      UsersModel.Sse.Events.UserFriendsUpdated,
      [this.user.id],
      {
        friends,
        blocked,
      },
    );
  }
}

export default UserExtFriends;
