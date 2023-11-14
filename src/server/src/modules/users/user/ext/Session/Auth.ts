import { Auth } from '@typings/auth';
import UserExtSession from '.';
import { HttpError } from '@/helpers/decorators/httpError';

 class UserExtSessionAuth {
  constructor(private readonly session: UserExtSession) {}
  public get raw(): Auth.Token {
    if (!this.session.loggedIn)
      throw new HttpError('User is not logged in; User#auth#data');
    return this.session.observer.get('token');
  }
  get token(): string {
    return this.raw.access_token;
  }
  get refreshToken(): string {
    return this.raw.refresh_token;
  }
  get ttl(): number {
    return this.raw.secret_valid_until * 1000;
  }
  isTokenValid(): boolean {
    return this.ttl > Date.now();
  }
  updateNewToken(data: Auth.Token): void {
    this.session.observer.set('token', data);
  }
}

export default UserExtSessionAuth;