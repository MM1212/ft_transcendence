import { Session } from '@fastify/secure-session';
import User from '../..';
import UserExtBase from '../Base';
import { IAuthSession } from '@typings/auth/session';
import { IAuthSessionUser } from '@typings/auth/session/user';
import deepMerge from '@shared/deepMerge';
import { CacheObserver } from '@shared/CacheObserver';
import UserExtSessionAuth from './Auth';

class UserExtSession extends UserExtBase {
  public readonly observer: CacheObserver<IAuthSessionUser>;
  public readonly auth: UserExtSessionAuth = new UserExtSessionAuth(this);
  constructor(
    user: User,
    public readonly session: Session<IAuthSession>,
  ) {
    super(user);
    if (!this.sData) this.session.set('user', { loggedIn: false });
    this.observer = new CacheObserver(this.sData ?? { loggedIn: false });
  }
  get loggedIn(): boolean {
    return this.observer.get('loggedIn');
  }
  set loggedIn(value: boolean) {
    this.observer.set('loggedIn', value);
  }
  get dummy(): boolean {
    return this.observer.get('dummy');
  }
  set dummy(value: boolean) {
    this.observer.set('dummy', value);
  }
  private get sData(): IAuthSessionUser | undefined {
    return this.session.data()?.user;
  }
  sync(): UserExtSession {
    const data = deepMerge<IAuthSessionUser>(
      {},
      this.sData ?? { loggedIn: false },
      this.user.public,
    );
    this.session.set('user', data);
    this.observer.setTo(data);
    return this;
  }
  logout(): void {
    this.session.set('user', { loggedIn: false });
    this.observer.setTo(this.session.data()!.user);
  }
}



export default UserExtSession;
