import { Session, SessionData } from '@fastify/secure-session';
import { FastifyRequest, FastifyInstance } from 'fastify';
import { IAuthSession } from '@typings/auth/session';

declare module 'fastify' {
  interface FastifyInstance {
    createSecureSession(
      data?: Record<string, any>,
    ): fastifySecureSession.Session;
    decodeSecureSession(
      cookie: string,
      log?: FastifyBaseLogger,
      sessionName?: string,
    ): fastifySecureSession.Session | null;
    encodeSecureSession(
      session: fastifySecureSession.Session,
      sessionName?: string,
    ): string;
  }
  interface FastifyRequest {
    session: Session;
  }
}

declare module '@fastify/secure-session' {
  interface SessionData extends IAuthSession {}
}
