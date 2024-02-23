import {
  Injectable,
  UnauthorizedException,
  HttpException,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/services/users.service';
import { AppService } from '@/app.service';
import { FastifyInstance } from 'fastify';
import { Socket } from 'socket.io';
import User from '@/modules/users/user';
import { GlobalFilter } from '@/filters/GlobalFilter';

@UseFilters(GlobalFilter)
@Injectable()
export class AuthGatewayGuard {
  constructor(
    private readonly usersService: UsersService,
    private readonly rootService: AppService,
  ) {}
  private get app(): FastifyInstance {
    return this.rootService.app.getHttpAdapter().getInstance();
  }
  private async handle(client: Socket): Promise<User | null> {
    if (!client.handshake.headers.cookie)
      throw new UnauthorizedException('No session cookie');
    const sessionId = this.app.parseCookie(
      client.handshake.headers.cookie,
    ).session;
    if (!sessionId) throw new UnauthorizedException('No session cookie');
    const session = this.app.decodeSecureSession(sessionId);
    if (!session) throw new UnauthorizedException('Invalid session cookie');
    const userData = session.get('user');
    if (!userData?.loggedIn) throw new UnauthorizedException('Not logged in');
    try {
      const user = await this.usersService.get(userData.id);
      if (!user) throw new UnauthorizedException('Unknown User');
      return user;
    } catch (e) {
      if (e instanceof HttpException)
      throw new UnauthorizedException(e.message);
      console.error(e);
      throw new Error(e.message);
    }
  }
  async canActivate(client: Socket): Promise<boolean> {
    const user = await this.handle(client);
    if (!user) return false;
    client.data.user = user;
    return true;
  }
}
