import { Injectable } from '@nestjs/common';
import { HTTPContext, Response } from 'typings/http';
import crypto from 'crypto';
import API from '@typings/api';
import { User } from '@/helpers/User';
import { Auth } from '@typings/auth';
import { ConfigService } from '@nestjs/config';
import { IntraAPI } from '@/helpers/Intra';
import { DbService } from '@/modules/db/db.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService<ImportMetaEnv>,
    private readonly intra: IntraAPI,
    private readonly db: DbService,
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
  public buildRequestTokenUrl(req: Auth.TokenRequest): string {
    const url = new URL(this.requestTokenUri);
    let grantType: string;
    switch (req.type) {
      case 'new':
        grantType = 'authorization_code';
        break;
      case 'refresh':
        grantType = 'refresh_token';
        break;
      default:
        throw new Error('Invalid token type');
    }
    url.searchParams.append('grant_type', grantType);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('client_secret', this.secret);
    url.searchParams.append('redirect_uri', this.redirectUri);
    switch (req.type) {
      case 'new':
        url.searchParams.append('code', req.code);
        break;
      case 'refresh':
        url.searchParams.append('refresh_token', req.refreshToken);
        break;
    }
    return url.toString();
  }
  public login(ctx: HTTPContext): void {
    const nonce = this.genNonce();
    const url = this.buildRedirectUri(nonce);
    ctx.session.set('nonce', nonce);
    console.log(`[Auth] [42] Login nonce: ${nonce} url: ${url}`);
    ctx.res.status(302).redirect(url);
  }
  public async requestToken<T extends Auth.TokenRequest>(
    user: User,
    type: T['type'],
    data: Omit<T, 'type'>,
  ): Promise<API.Response<Auth.Token>> {
    try {
      const resp = await fetch(
        this.buildRequestTokenUrl({ type, ...data } as T),
        {
          method: 'POST',
        },
      ).then((resp) => resp.json());
      if (!resp) return API.buildErrorResponse('Failed to get token');
      const token = resp as Auth.Token;
      return API.buildOkResponse(token);
    } catch (e) {
      return API.buildErrorResponse(e.message);
    }
  }
  public async callback({
    req,
    res,
    session,
  }: HTTPContext): Promise<API.Response<string> | Response> {
    const { code, state } = req.query as Record<string, string>;
    console.log(`[Auth] [42] Callback code: ${code} state: ${state}`);

    if (!code || !state)
      return res
        .status(400)
        .send(API.buildErrorResponse('Missing code or state'));
    const nonce = session.get('nonce');
    if (!nonce || nonce !== state)
      return res.status(400).send(API.buildErrorResponse('Invalid state'));
    session.set('nonce', undefined);
    const user = new User(session);
    const resp = await this.requestToken<Auth.NewToken>(user, 'new', { code });
    if (resp.status !== 'ok') return res.status(500).send(resp);
    user.update('loggedIn', true);
    user.auth.updateNewToken(resp.data);
    this.intra.token = user.auth.token;
    try {
      const apiData = await this.intra.me();
      if (apiData) {
        const {
          id,
          login,
          image: { link },
        } = apiData;
        let userData = await this.db.users.getByStudentId(id);
        if (!userData)
          userData = await this.db.users.create({
            studentId: id,
            nickname: login,
            avatar: link,
          });
        user.merge(userData);
      }
    } catch (e) {
      console.error(e);
      user.update('loggedIn', false);
      return res.status(500).send(API.buildErrorResponse(e.message));
    }
    console.log(`[Auth] [42] Logged in as `, user.session.data());
    return res.redirect(302, `${this.config.get<string>('FRONTEND_URL')}`);
  }
}
