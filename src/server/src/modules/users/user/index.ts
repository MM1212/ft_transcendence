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
import UserExtInventory from './ext/Inventory';
import UserExtNotifications from './ext/Notifications';
import { UserExtCredits } from './ext/Credits';
import { GroupEnumValues } from '@typings/utils';
import { UserExtElo } from './ext/Elo';
import UserExtAchievements from './ext/Achievements/index';

class User extends CacheObserver<UsersModel.Models.IUser> {
  public readonly friends: UserExtFriends = new UserExtFriends(this);
  public readonly alerts: UserExtAlerts = new UserExtAlerts(this);
  public readonly character: UserExtCharacter = new UserExtCharacter(this);
  public readonly achievements: UserExtAchievements = new UserExtAchievements(
    this,
  );
  public readonly inventory: UserExtInventory = new UserExtInventory(this);
  public readonly notifications: UserExtNotifications =
    new UserExtNotifications(this);
  public readonly credits: UserExtCredits = new UserExtCredits(this);
  public readonly elo: UserExtElo = new UserExtElo(this);

  constructor(
    data: UsersModel.Models.IUser,
    private readonly helpers: UserDependencies,
  ) {
    super(data);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public get public(): UsersModel.Models.IUserInfo {
    const {
      studentId,
      friends,
      blocked,
      chats,
      storedStatus,
      tfa,
      connected,
      character,
      notifications,
      inventory,
      achievements,
      ...user
    } = this.get();
    (user as UsersModel.Models.IUserInfo).leaderboard = {
      elo: user.leaderboard.elo,
    };
    return user satisfies UsersModel.Models.IUserInfo;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // getters
  public get id(): number {
    return this.get('id');
  }

  public get type(): GroupEnumValues<UsersModel.Models.Types> {
    return this.get('type');
  }

  public get isBot(): boolean {
    return this.type === UsersModel.Models.Types.Bot;
  }

  public get studentId(): number | undefined {
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

  public get status(): GroupEnumValues<UsersModel.Models.Status> {
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

  private propagateTo(
    targets: number[],
    firstKey: keyof UsersModel.Models.IUserInfo,
    ...keys: (keyof UsersModel.Models.IUserInfo)[]
  ): void {
    keys.unshift(firstKey);
    const data = keys.reduce(
      (acc, key) => ({ ...acc, [key]: this.get(key) }),
      {} as Partial<UsersModel.Models.IUserInfo>,
    );
    this.helpers.events.emit('user:updated', this, data);

    if (targets.length === 0) {
      this.helpers.sseService.emitToAll<UsersModel.Sse.UserUpdatedEvent>(
        UsersModel.Sse.Events.UserUpdated,
        { id: this.id, ...data },
      );
      return;
    }
    this.helpers.sseService.emitToTargets<UsersModel.Sse.UserUpdatedEvent>(
      UsersModel.Sse.Events.UserUpdated,
      targets,
      { id: this.id, ...data },
    );
  }

  /**
   * Syncs the user with all connected clients
   */
  public propagate(
    firstKey: keyof UsersModel.Models.IUserInfo,
    ...keys: (keyof UsersModel.Models.IUserInfo)[]
  ): void {
    this.propagateTo([], firstKey, ...keys);
  }
  public propagateSelf(
    firstKey: keyof UsersModel.Models.IUserInfo,
    ...keys: (keyof UsersModel.Models.IUserInfo)[]
  ): void {
    this.propagateTo([this.id], firstKey, ...keys);
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
