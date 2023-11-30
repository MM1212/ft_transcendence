import UsersModel from '@typings/models/users';
import User from '../..';
import UserExtBase from '../Base';
import { HttpError } from '@/helpers/decorators/httpError';

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
  async add(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    if (this.user.id === target.id) throw new HttpError('You cannot add yourself');
    if (this.is(target.id)) throw new HttpError('User already added');
    if (this.isBlocked(target.id)) throw new HttpError('User is blocked');
    if (target.friends.isBlocked(this.user.id))
      throw new HttpError('User has blocked you');
    // temporarly call acceptFriendRequest
    await this.acceptFriendRequest(id);
  }
  async addByName(name: string): Promise<void> {
    const target = await this.helpers.usersService.getByNickname(name);
    if (!target) throw new HttpError('User not found');
    await this.add(target.id);
  }
  private async acceptFriendRequest(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    await this.helpers.db.users.update(this.user.id, {
      friends: {
        connect: { id },
      },
    });
    await this.helpers.db.users.update(id, {
      friendOf: {
        connect: { id: this.user.id },
      },
    });
    this.user.set('friends', (prev) => [...prev, id]);
    target.set('friends', (prev) => [...prev, this.user.id]);
    // this.user.syncWithSessions();
    // target.syncWithSessions();
    this.propagate([{ id, type: 'add' }], []);
    target.friends.propagate([{ id: this.user.id, type: 'add' }], []);
  }
  async remove(id: number): Promise<void> {
    const target = await this.helpers.usersService.get(id);
    if (!target) throw new HttpError('User not found');
    if (!this.ids.includes(id)) throw new HttpError('User not found');
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
    if (this.blockedIds.includes(id)) throw new HttpError('User already blocked');
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
