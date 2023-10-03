import { Injectable } from '@nestjs/common';
import { HTTPContext } from 'typings/http';
import crypto from 'crypto';
import API from '@typings/api';
import { User } from '@/helpers/User';
import { Auth } from '@typings/auth';
import { ConfigService } from '@nestjs/config';
import { IntraAPI } from '@/helpers/Intra';
import { IUser } from '@typings/user';
import { writeFileSync } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService<ImportMetaEnv>,
    private readonly intra: IntraAPI,
  ) {}
  private get clientId(): string {
    return this.config.get('BACKEND_42_CLIENT_ID')!;
  }
  private get secret(): string {
    return this.config.get('BACKEND_42_SECRET')!;
  }
  private get loginUri(): string {
    return this.config.get('BACKEND_42_LOGIN_URI')!;
  }
  private get redirectUri(): string {
    return this.config.get('BACKEND_42_REDIRECT_URI')!;
  }
  private get requestTokenUri(): string {
    return this.config.get('BACKEND_42_REQUEST_TOKEN_URI')!;
  }

  private genNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }
  private buildRedirectUri(nonce: string): string {
    const url = new URL(this.loginUri);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.redirectUri);
    url.searchParams.append('scope', 'public');
    url.searchParams.append('state', nonce);
    url.searchParams.append('response_type', 'code');
    return url.toString();
  }
  private buildRequestTokenUrl(code: string, refreshToken?: string): string {
    const url = new URL(this.requestTokenUri);
    url.searchParams.append('grant_type', 'authorization_code');
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('client_secret', this.secret);
    url.searchParams.append('code', code);
    url.searchParams.append('redirect_uri', this.redirectUri);
    if (refreshToken) url.searchParams.append('refresh_token', refreshToken);
    return url.toString();
  }
  public login(ctx: HTTPContext): void {
    const nonce = this.genNonce();
    const url = this.buildRedirectUri(nonce);
    ctx.session.set('nonce', nonce);
    console.log(`[Auth] [42] Login nonce: ${nonce} url: ${url}`);
    ctx.res.status(302).redirect(url);
  }
  public async callback({
    req,
    res,
    session,
  }: HTTPContext): Promise<API.Response<string> | undefined> {
    const { code, state } = req.query as Record<string, string>;
    console.log(`[Auth] [42] Callback code: ${code} state: ${state}`);

    if (!code || !state) {
      res.status(400);
      return API.buildErrorResponse('Missing code or state');
    }
    const nonce = session.get('nonce');
    if (!nonce || nonce !== state) {
      res.status(400);
      return API.buildErrorResponse('Invalid state');
    }
    session.set('nonce', undefined);
    const user = new User(session);
    const resp = await fetch(
      this.buildRequestTokenUrl(
        code,
        user.loggedIn ? user.auth.refreshToken : undefined,
      ),
      {
        method: 'POST',
      },
    ).then((resp) => resp.json());

    if (!resp) {
      res.status(500);
      return API.buildErrorResponse('Failed to get token');
    }
    const token = resp as Auth.Token;

    user.update('token', token);
    user.update('loggedIn', true);
    this.intra.token = user.auth.token;
    try {
      const apiData = await this.intra.me();
      // console.log(apiData);
      writeFileSync('apiData.json', JSON.stringify(apiData));
      if (apiData) {
        const {
          id,
          login,
          image: { link },
        } = apiData;
        const userData: IUser = {
          id,
          avatar: link,
          createdAt: Date.now(),
          nickname: login,
          studentId: id,
          url: `https://profile.intra.42.fr/users/${login}`,
        };
        user.merge(userData);
      }
    } catch (e) {
      console.error(e);
    }

    res.status(302).redirect(`${this.config.get<string>('FRONTEND_URL')}`);
  }
}
