// export enum Endpoints {
//   Sse = '/sse',
//   SseTest = '/sse/test',
//   UsersMe = '/users/me',
//   AuthLogin = '/auth/42/login',
//   AuthLogout = '/auth/42/logout',
//   LobbySocket = '/lobby',
//   LobbyBackground = '/static/lobby.png'
// }

import { SseModel, AuthModel, ChatModel } from '@typings/api/models';
import LobbyModel from '@typings/models/lobby';
import UsersModel from '@typings/models/users';
import { EndpointMethods } from './base/endpoint';
import PongModel from '@typings/models/pong';

export type All =
  | SseModel.Endpoints.All
  | AuthModel.Endpoints.All
  | LobbyModel.Endpoints.All
  | ChatModel.Endpoints.All
  | UsersModel.Endpoints.All
  | PongModel.Endpoints.All;

export type Registry =
  & SseModel.Endpoints.Registry
  & AuthModel.Endpoints.Registry
  & UsersModel.Endpoints.Registry
  & ChatModel.Endpoints.Registry
  & {
    [EndpointMethods.Get]: Record<never, never>;
    [EndpointMethods.Post]: Record<never, never>;
    [EndpointMethods.Put]: Record<never, never>;
    [EndpointMethods.Delete]: Record<never, never>;
    [EndpointMethods.Patch]: Record<never, never>;
  };
