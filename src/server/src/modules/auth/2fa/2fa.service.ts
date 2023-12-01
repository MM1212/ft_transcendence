import { UserExtWithSession } from '@/modules/users/user';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import speakeasy from '@levminer/speakeasy';
import QrCode from 'qrcode';
import { UsersService } from '@/modules/users/users.service';
import { Session } from '@fastify/secure-session';

@Injectable()
export class TfaService {
  constructor(
    private readonly config: ConfigService<ImportMetaEnv>,
    private readonly usersService: UsersService,
  ) {}

  public get tfaIssuer(): string {
    return this.config.get<string>('BACKEND_TFA_ISSUER')!;
  }
  public get tfaSecretLength(): number {
    return parseInt(this.config.get<string>('BACKEND_TFA_SECRET_LENGTH')!);
  }

  public async setup(user: UserExtWithSession): Promise<string> {
    if (user.session.auth.tfaEnabled)
      throw new ForbiddenException('Two-Factor Auth is already enabled');
    const secret =
      user.session.session.get('tfa_secret') ??
      speakeasy.generateSecret({
        length: this.tfaSecretLength,
      }).base32;
    const otpauthURL = speakeasy.otpauthURL({
      issuer: this.tfaIssuer,
      label: user.nickname,
      secret: secret,
      encoding: 'base32',
    });
    try {
      const qrCode = await new Promise<string>((r, t) =>
        QrCode.toDataURL(otpauthURL, (e, d) => (e ? t(e) : r(d))),
      );
      user.session.session.set('tfa_secret', secret);
      return qrCode;
    } catch (e) {
      throw new InternalServerErrorException('Failed to generate QR Code');
    }
  }

  public async setupConfirm(user: UserExtWithSession, code: string) {
    if (user.session.auth.tfaEnabled)
      throw new ForbiddenException('Two-Factor Auth is already enabled');
    const secret = user.session.session.get('tfa_secret');
    if (!secret)
      throw new ForbiddenException('Two-Factor Auth secret is not set');
    const match = await user.session.auth.tfaMatch(code, secret);
    if (!match) throw new ForbiddenException('Invalid code');
    await user.session.auth.enableTfa(secret);
    user.session.session.set('tfa_secret', undefined);
  }

  public async getQrCode(user: UserExtWithSession): Promise<string> {
    if (!user.session.auth.tfaEnabled)
      throw new ForbiddenException('Two-Factor Auth is not enabled');
    const secret = user.session.auth.tfaSecret;
    if (!secret)
      throw new ForbiddenException('Two-Factor Auth secret is not set');
    const otpauthURL = speakeasy.otpauthURL({
      issuer: this.tfaIssuer,
      label: user.nickname,
      secret: secret,
      encoding: 'base32',
    });
    try {
      const qrCode = await new Promise<string>((r, t) =>
        QrCode.toDataURL(otpauthURL, (e, d) => (e ? t(e) : r(d))),
      );
      return qrCode;
    } catch (e) {
      throw new InternalServerErrorException('Failed to generate QR Code');
    }
  }

  public async disable(user: UserExtWithSession, code: string) {
    if (!user.session.auth.tfaEnabled)
      throw new ForbiddenException('Two-Factor Auth is not enabled');
    const match = await user.session.auth.tfaMatch(code);
    if (!match) throw new ForbiddenException('Invalid code');
    await user.session.auth.disableTfa();
  }

  public async callback(
    userId: number,
    session: Session,
    code: string,
  ) {
    const user = await this.usersService.get(userId);
    if (!user) throw new ForbiddenException();

    if (!user.get('tfa.enabled')) throw new ForbiddenException();
    const uSession = user.withSession(session);

    const match = await uSession.session.auth.tfaMatch(code);
    if (!match) throw new ForbiddenException('Invalid code');
    uSession.session.sync().loggedIn = true;
    uSession.session.session.set('tfa_secret', undefined);
    uSession.session.session.set('tfa_user_id', undefined);
    console.log(`[Auth] [TFA] Logged in as `, user.public);
  }
}
