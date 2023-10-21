import { SessionData } from '@fastify/secure-session';
import { IAuthSession } from '@typings/auth/session';

declare module '@fastify/secure-session' {
  interface SessionData extends IAuthSession {}
}
