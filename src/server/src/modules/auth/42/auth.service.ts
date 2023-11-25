import {
  BadRequestException,
  HttpRedirectResponse,
  Injectable,
} from '@nestjs/common';
import { HTTPContext } from 'typings/http';
import crypto from 'crypto';
import * as API from '@typings/api';
import { Auth } from '@typings/auth';
import { ConfigService } from '@nestjs/config';
import { IntraAPI } from '@/helpers/Intra';
import { UsersService } from '@/modules/users/users.service';
import { HttpError } from '@/helpers/decorators/httpError';
import UsersModel from '@typings/models/users';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService<ImportMetaEnv>,
    private readonly intra: IntraAPI,
    private readonly usersService: UsersService,
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
  public login(ctx: HTTPContext): Partial<HttpRedirectResponse> {
    const nonce = this.genNonce();
    const url = this.buildRedirectUri(nonce);
    ctx.session.set('nonce', nonce);
    console.log(`[Auth] [42] Login nonce: ${nonce} url: ${url}`);
    return { url };
  }
  public async requestToken<T extends Auth.TokenRequest>(
    type: T['type'],
    data: Omit<T, 'type'>,
  ): Promise<API.Response<Auth.Token>> {
    try {
      const resp = await fetch(
        this.buildRequestTokenUrl({ type, ...data } as T),
        {
          method: 'POST',
        },
      );
      const body = await resp.json();
      if (!body) return API.buildErrorResponse('Failed to get token');
      if (body.error)
        return API.buildErrorResponse(
          `${body.error}: ${body.error_description} ${resp.status}`,
        );
      const token = body as Auth.Token;
      return API.buildOkResponse(token);
    } catch (e) {
      return API.buildErrorResponse(e.message);
    }
  }
  public async callback({
    req,
    session,
  }: HTTPContext): Promise<Partial<HttpRedirectResponse>> {
    const { code, state } = req.query as Record<string, string>;
    console.log(`[Auth] [42] Callback code: ${code} state: ${state}`);

    if (!code || !state) throw new BadRequestException('Missing code or state');
    const nonce = session.get('nonce');
    if (!nonce || nonce !== state)
      throw new BadRequestException('Invalid state');
    session.set('nonce', undefined);
    const resp = await this.requestToken<Auth.NewToken>('new', { code });
    if (resp.status !== 'ok') throw new HttpError(resp.errorMsg);

    this.intra.token = resp.data.access_token;
    try {
      const apiData = await this.intra.me();
      if (!apiData) throw new Error('Failed to get user data from 42 API');
      if ((apiData as any).error) throw new HttpError((apiData as any).error);
      const { id, login } = apiData;
      let user = await this.usersService.getByStudentId(id);
      if (!user)
        user = await this.usersService.create({
          studentId: id,
          avatar: UsersModel.Models.DEFAULT_AVATAR,
          nickname: login,
        });
      const uSession = user.withSession(req.session);
      uSession.session.sync().loggedIn = true;
      uSession.session.auth.updateNewToken(resp.data);
      console.log(`[Auth] [42] Logged in as `, user.public);
      return { url: `${this.config.get<string>('FRONTEND_URL')}` };
    } catch (e) {
      console.error(e);
      req.session.set('user', { loggedIn: false });
      throw new HttpError('Failed to get user data from 42 API');
    }
  }

  public async dummy(
    ctx: HTTPContext,
    dummyId: number,
  ): Promise<Partial<HttpRedirectResponse>> {
    let dummyUser = await this.usersService.getByStudentId(dummyId);
    console.log(dummyId, dummyUser);

    if (!dummyUser) {
      dummyUser = await this.usersService.create({
        studentId: dummyId,
        avatar: UsersModel.Models.DEFAULT_AVATAR,
        nickname: `Dummy${dummyId}`,
      });
    }
    const uSession = dummyUser.withSession(ctx.session);
    uSession.session.sync().loggedIn = true;
    uSession.session.dummy = true;
    console.log(`[Auth] [42] Logged in as dummy`);
    return { url: `${this.config.get<string>('FRONTEND_URL')}` };
  }
}
