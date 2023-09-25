import { User } from '@/helpers/User';
import '@fastify/secure-session/types';
import { Session } from '@fastify/secure-session/types';
import { FastifyReply, FastifyRequest } from 'fastify';

export type Request = FastifyRequest;
export type Response = FastifyReply;

export interface HTTPContext {
  readonly req: Request;
  readonly res: Response;
  readonly session: Session;
  readonly user?: User;
}
