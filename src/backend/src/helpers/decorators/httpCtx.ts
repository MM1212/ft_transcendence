import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { HTTPContext } from 'typings/http';
import { User } from '../User';

const HttpCtx = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): HTTPContext => {
    const req: FastifyRequest = ctx.switchToHttp().getRequest();
    const res: FastifyReply = ctx.switchToHttp().getResponse();
    const userData = req.session.get('user');
    const user = userData ? new User(req.session) : undefined;

    
    return { req, res, session: req.session, user };
  },
);

export default HttpCtx;
