import User, { UserExtWithSession } from '@/modules/users/user';
import { Session } from '@fastify/secure-session/types';
import { FastifyReply, FastifyRequest } from 'fastify';

export type Request = FastifyRequest;
export type Response = FastifyReply;

export type HTTPContext<T extends boolean = false> = {
  readonly req: Request;
  readonly res: Response;
  readonly session: Session;
} & (T extends true ? { readonly user: UserExtWithSession } : { readonly user?: User});
