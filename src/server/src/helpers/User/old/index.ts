import {
  IAuthSessionLoggedUser,
  IAuthSessionUser,
  IAuthSessionUserData,
} from '@typings/auth/session/user';
import { IUser } from '@typings/user';
import { UserAuthModule } from './modules/auth';
import { Session } from '@fastify/secure-session';
import { IAuthSession } from '@typings/auth/session';

/**
 * @deprecated
 */
export class User {
  public readonly auth: UserAuthModule;
  constructor(protected readonly data: Session<IAuthSession>) {
    this.auth = new UserAuthModule(this);
  }
  get public(): IUser {
    return {
      id: this.id,
      studentId: this.studentId,
      nickname: this.name,
      avatar: this.avatar,
      createdAt: this.createdAt,
    };
  }
  get sData(): IAuthSessionUser | undefined {
    return this.data.data()?.user;
  }
  get loggedIn(): boolean {
    return this.sData?.loggedIn ?? false;
  }
  get id(): IUser['id'] {
    if (!this.sData?.loggedIn) {
      throw new Error('User is not logged in; User#id');
    }
    return this.sData?.id;
  }
  get studentId(): IUser['studentId'] {
    if (!this.sData?.loggedIn) {
      throw new Error('User is not logged in; User#studentId');
    }
    return this.sData?.studentId;
  }

  get name(): IUser['nickname'] {
    if (!this.sData?.loggedIn) {
      throw new Error('User is not logged in; User#name');
    }
    return this.sData?.nickname;
  }

  get avatar(): IUser['avatar'] {
    if (!this.sData?.loggedIn) {
      throw new Error('User is not logged in; User#avatar');
    }
    return this.sData?.avatar;
  }

  get asLoggedIn(): IAuthSessionLoggedUser {
    if (!this.sData?.loggedIn) {
      throw new Error('User is not logged in; User#asLoggedIn');
    }
    return this.data.data()?.user as unknown as IAuthSessionLoggedUser;
  }
  get createdAt(): IUser['createdAt'] {
    if (!this.sData?.loggedIn) {
      throw new Error('User is not logged in; User#createdAt');
    }
    return this.sData?.createdAt;
  }
  get session(): Session<IAuthSession> {
    return this.data;
  }
  update<
    K extends keyof IAuthSessionUserData = keyof IAuthSessionUserData,
    T extends IAuthSessionUserData[K] = IAuthSessionUserData[K],
  >(key: K, value?: T): User {
    const data = this.data.data()?.user ?? { loggedIn: false };

    data[key as keyof IAuthSessionUser] =
      value as unknown as IAuthSessionUser[K & keyof IAuthSessionUser];
    this.data.set('user', data);
    return this;
  }
  merge(obj: Partial<IAuthSessionUserData>): User {
    let data = this.data.data()?.user ?? { loggedIn: false };

    data = {
      ...data,
      ...(obj as IAuthSessionUserData),
    };
    this.data.set('user', data);
    return this;
  }
  logout(): void {
    this.data.set('user', { loggedIn: false });
  }
}
