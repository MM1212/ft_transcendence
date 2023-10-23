import { Auth } from '@typings/auth';
import { User } from '../..';

export class UserAuthModule {
  constructor(private readonly user: User) {}
  public get raw(): Auth.Token {
    if (!this.user.loggedIn)
      throw new Error('User is not logged in; User#auth#data');
    return this.user.asLoggedIn?.token;
  }
  get token(): string {
    return this.raw?.access_token;
  }
  get refreshToken(): string {
    return this.raw?.refresh_token;
  }
  get ttl(): number {
    return this.raw.secret_valid_until * 1000;
  }
  isTokenValid(): boolean {
    return this.ttl > Date.now();
  }
  updateNewToken(data: Auth.Token): void {
    this.user.update('token', data);
  }
}
