import { UserDependencies } from './dependencies';
import { CacheObserver } from '@shared/CacheObserver';
import UsersModel from '@typings/models/users';
import { NestedPartial } from '@shared/CacheObserver/types';
import UserExtSession from './ext/Session';
import { Session } from '@fastify/secure-session';
import { IAuthSession } from '@typings/auth/session';
import UserExtFriends from './ext/Friends';
import { HttpError } from '@/helpers/decorators/httpError';
import { AuthModel } from '@typings/api';
import UserExtAlerts from './ext/Alerts';
import UserExtCharacter from './ext/Character';
import UserExtQuests from './ext/Quests';
import UserExtInventory from './ext/Inventory';

class User extends CacheObserver<UsersModel.Models.IUser> {
  public readonly friends: UserExtFriends = new UserExtFriends(this);
  public readonly alerts: UserExtAlerts = new UserExtAlerts(this);
  public readonly character: UserExtCharacter = new UserExtCharacter(this);
  public readonly quests: UserExtQuests = new UserExtQuests(this);
  public readonly inventory: UserExtInventory = new UserExtInventory(this);

  constructor(
    data: UsersModel.Models.IUser,
    private readonly helpers: UserDependencies,
  ) {
    super(data);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public get public(): UsersModel.Models.IUserInfo {
    const {
      friends,
      blocked,
      chats,
      storedStatus,
      tfa,
      connected,
      character,
      quests,
      ...user
    } = this.get();
    return user satisfies UsersModel.Models.IUserInfo;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

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

  public get isConnected(): boolean {
    return this.get('connected');
  }

  public async refresh(): Promise<void> {
    const data = await this.helpers.db.users.get(this.id);
    if (!data)
      throw new HttpError(
        `User with id ${this.id} was not found in database while refreshing`,
      );
    this.setTo(data);
  }
  public async save(
    {
      avatar,
      nickname,
      status,
      firstLogin,
    }: NestedPartial<UsersModel.Models.IUserInfo> = this.public,
    propagate: boolean = false,
  ): Promise<boolean> {
    try {
      const result = await this.helpers.db.users.update(this.id, {
        avatar,
        nickname,
        storedStatus: status,
        firstLogin,
      });
      if (!result) return false;
      if (status !== undefined) this.set('status', status);
      for (const [key, value] of Object.entries(result))
        this.set(key as keyof UsersModel.Models.IUser, value as any);
      if (propagate) this.propagate('avatar', 'nickname', 'status');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Syncs the user with all connected clients
   */
  public propagate(
    firstKey: keyof UsersModel.Models.IUserInfo,
    ...keys: (keyof UsersModel.Models.IUserInfo)[]
  ): void {
    keys.unshift(firstKey);
    const data = keys.reduce(
      (acc, key) => ({ ...acc, [key]: this.get(key) }),
      {} as Partial<UsersModel.Models.IUserInfo>,
    );

    this.helpers.sseService.emitWithTarget<UsersModel.Sse.UserUpdatedEvent>(
      UsersModel.Sse.Events.UserUpdated,
      this.id,
      { id: this.id, ...data },
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

  public get publicSession(): AuthModel.DTO.Session {
    return {
      ...this.session.user.public,
      tfaEnabled: this.session.auth.tfaEnabled,
    };
  }
}

export type { UserExtWithSession };

export default User;
