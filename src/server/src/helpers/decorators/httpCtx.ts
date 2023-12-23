import {
  ArgumentMetadata,
  ExecutionContext,
  Injectable,
  PipeTransform,
  createParamDecorator,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { HTTPContext } from 'typings/http';
import { UsersService } from '@/modules/users/services/users.service';
import { IAuthSession } from '@typings/auth/session';

@Injectable()
class ParseUserPipe implements PipeTransform {
  constructor(private readonly usersService: UsersService) {}
  async transform(
    value: HTTPContext,
    metadata: ArgumentMetadata,
  ): Promise<HTTPContext> {
    if (metadata.type !== 'custom') return value;
    const { session } = value;
    if (!session) return value;
    const { user } = session.data() as IAuthSession;
    if (!user || !user.loggedIn) return value;
    const instance = await this.usersService.get(user.id);
    if (!instance) return value;
    return { ...value, user: instance.withSession(session) };
  }
}

const preCtx = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): HTTPContext => {
    const req: FastifyRequest = ctx.switchToHttp().getRequest();
    const res: FastifyReply = ctx.switchToHttp().getResponse();

    return { req, res, session: req.session, user: undefined };
  },
);

const HttpCtx = () => preCtx(ParseUserPipe);

export default HttpCtx;
