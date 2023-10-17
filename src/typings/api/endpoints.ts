// export enum Endpoints {
//   Sse = '/sse',
//   SseTest = '/sse/test',
//   UsersMe = '/users/me',
//   AuthLogin = '/auth/42/login',
//   AuthLogout = '/auth/42/logout',
//   LobbySocket = '/lobby',
//   LobbyBackground = '/static/lobby.png'
// }

import { SseModel, AuthModel } from '@typings/api/models';
import LobbyModel from '@typings/models/lobby';

export type All = SseModel.Endpoints.All | AuthModel.Endpoints.All | LobbyModel.Endpoints.All;
