import { Auth } from '@typings/auth';
import UserExtSession from '.';
import { HttpError } from '@/helpers/decorators/httpError';
import { AuthModel } from '@typings/api';
import speakeasy from '@levminer/speakeasy';

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

  get tfa(): AuthModel.Models.TFA {
    return this.session.user.get('tfa');
  }
  get tfaEnabled(): boolean {
    return this.tfa.enabled;
  }
  get tfaSecret(): string | undefined {
    return this.tfa.secret;
  }
  isTokenValid(): boolean {
    return this.ttl > Date.now();
  }
  updateNewToken(data: Auth.Token): void {
    this.session.observer.set('token', data);
  }
  async tfaMatch(
    code: string,
    secret: string | undefined = this.tfaSecret,
  ): Promise<boolean> {
    if (!secret) return false;
    
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });
  }

  async enableTfa(secret: string): Promise<void> {
    const user = this.session.user;
    await user.helpers.db.users.update(user.id, {
      tfaEnabled: true,
      tfaSecret: secret,
    });
    user.set('tfa.enabled', true).set('tfa.secret', secret);
  }
  async disableTfa(): Promise<void> {
    const user = this.session.user;
    await user.helpers.db.users.update(user.id, {
      tfaEnabled: false,
      tfaSecret: null,
    });
    user.set('tfa.enabled', false).set('tfa.secret', undefined);
  }
}

export default UserExtSessionAuth;
