import { Auth } from '@typings/auth';
import { User } from '../..';

export class UserAuthModule {
  constructor(private readonly user: User) {}
  private get data(): Auth.Token {
    return this.user?.asLoggedIn?.token;
  }
  get token(): string {
    return this.data?.access_token;
  }
  get refreshToken(): string | undefined {
    return this.data?.refresh_token;
  }
  get ttl(): number {
    return new Date(
      this.data.created_at * 1000 + this.data.expires_in * 1000,
    ).getTime();
  }
  isTokenValid(): boolean {
    return this.ttl > Date.now();
  }
}
