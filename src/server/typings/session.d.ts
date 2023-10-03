import { Session, SessionData } from '@fastify/secure-session';
import { FastifyRequest } from 'fastify';
import { IAuthSession } from '@typings/auth/session';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
  }
}

declare module '@fastify/secure-session' {
  interface SessionData extends IAuthSession {}
}
