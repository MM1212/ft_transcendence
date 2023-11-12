import { UserDependencies } from './dependencies';
import { CacheObserver } from '@shared/CacheObserver';
import UsersModel from '@typings/models/users';
import { NestedPartial } from '@shared/CacheObserver/types';
import UserExtSession from './ext/Session';
import { Session } from '@fastify/secure-session';
import { IAuthSession } from '@typings/auth/session';
import UserExtFriends from './ext/Friends';

class User extends CacheObserver<UsersModel.Models.IUser> {
  public readonly friends: UserExtFriends = new UserExtFriends(this);
  constructor(
    data: UsersModel.Models.IUser,
    public readonly helpers: UserDependencies,
  ) {
    super(data);
  }

  public get public(): UsersModel.Models.IUserInfo {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { friends, blocked, chats, storedStatus, ...user } = this.get();
    return user satisfies UsersModel.Models.IUserInfo;
  }

  // getters
  public get id(): number {
    return this.get('id');
  }

  public get studentId(): number {
    return this.get('studentId');
  }

  public get nickname(): string {
    return this.get('nickname');
  }

  public get avatar(): string {
    return this.get('avatar');
  }

  public get createdAt(): number {
    return this.get('createdAt');
  }

  public get status(): UsersModel.Models.Status {
    return this.get('status');
  }

  public get isOnline(): boolean {
    return this.status === UsersModel.Models.Status.Online;
  }

  public get isOffline(): boolean {
    return this.status === UsersModel.Models.Status.Offline;
  }

  public get isAway(): boolean {
    return this.status === UsersModel.Models.Status.Away;
  }

  public get isBusy(): boolean {
    return this.status === UsersModel.Models.Status.Busy;
  }

  public async refresh(): Promise<void> {
    const data = await this.helpers.db.users.get(this.id);
    if (!data)
      throw new Error(
        `User with id ${this.id} was not found in database while refreshing`,
      );
    this.setTo(data);
  }
  public async save(
    {
      avatar,
      nickname,
      status,
    }: NestedPartial<UsersModel.Models.IUserInfo> = this.public,
    propagate: boolean = false,
  ): Promise<boolean> {
    const result = await this.helpers.db.users.update(this.id, {
      avatar,
      nickname,
      storedStatus: status,
    });
    if (!result) return false;
    if (status !== undefined) this.set('status', status);
    for (const [key, value] of Object.entries(result))
      this.set(key as keyof UsersModel.Models.IUser, value as any);
    if (propagate) this.propagate('avatar', 'nickname', 'status');
    return true;
  }

  /**
   * Syncs the user with all connected clients
   */
  public propagate(...keys: (keyof UsersModel.Models.IUserInfo)[]): void {
    const data = { ...this.public };
    for (const key of keys) delete data[key];
    this.helpers.sseService.emitToAll<UsersModel.Sse.UserUpdatedEvent>(
      UsersModel.Sse.Events.UserUpdated,
      data,
    );
  }

  // EXT
  public useSession(session: Session<IAuthSession>): UserExtSession {
    return new UserExtSession(this, session);
  }
  public withSession(session: Session<IAuthSession>): UserExtWithSession {
    return new UserExtWithSession(
      this.get(),
      this.helpers,
      this.useSession(session),
    );
  }
}

class UserExtWithSession extends User {
  constructor(
    data: UsersModel.Models.IUser,
    helpers: UserDependencies,
    public readonly session: UserExtSession,
  ) {
    super(data, helpers);
  }
}

export type { UserExtWithSession };

export default User;
