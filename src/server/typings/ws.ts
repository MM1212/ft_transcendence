import User, { UserExtWithSession } from '@/modules/users/user';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events';
import { Socket } from 'socket.io';

export type ClientSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { user: User }
>;
