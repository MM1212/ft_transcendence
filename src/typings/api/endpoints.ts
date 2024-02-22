// export enum Endpoints {
//   Sse = '/sse',
//   SseTest = '/sse/test',
//   UsersMe = '/users/me',
//   AuthLogin = '/auth/42/login',
//   AuthLogout = '/auth/42/logout',
//   LobbySocket = '/lobby',
//   LobbyBackground = '/static/lobby.png'
// }

import type { SseModel, AuthModel, ChatModel } from '@typings/api/models';
import type DEPRECATED_LobbyModel from '@typings/models/lobby_old';
import type UsersModel from '@typings/models/users';
import type { EndpointMethods } from './base/endpoint';
import type NotificationsModel from '@typings/models/notifications';
import type PongModel from '@typings/models/pong';
import type InventoryModel from '@typings/models/users/inventory';
import type PongHistoryModel from '@typings/models/pong/history';
import type ShopModel from '@typings/models/shop';
import type LeaderboardModel from '@typings/models/leaderboard';
import AchievementsModel from '@typings/models/users/achievements';

export type All =
  | SseModel.Endpoints.All
  | AuthModel.Endpoints.All
  | DEPRECATED_LobbyModel.Endpoints.All
  | ChatModel.Endpoints.All
  | UsersModel.Endpoints.All
  | InventoryModel.Endpoints.All
  | NotificationsModel.Endpoints.All
  | PongModel.Endpoints.All
  | PongHistoryModel.Endpoints.All
  | ShopModel.Endpoints.All
  | LeaderboardModel.Endpoints.All
  | AchievementsModel.Endpoints.All;

export type Registry = SseModel.Endpoints.Registry &
  AuthModel.Endpoints.Registry &
  UsersModel.Endpoints.Registry &
  InventoryModel.Endpoints.Registry &
  ChatModel.Endpoints.Registry &
  PongModel.Endpoints.Registry &
  PongHistoryModel.Endpoints.Registry &
  NotificationsModel.Endpoints.Registry &
  ShopModel.Endpoints.Registry &
  LeaderboardModel.Endpoints.Registry &
  AchievementsModel.Endpoints.Registry & {
    [EndpointMethods.Get]: Record<never, never>;
    [EndpointMethods.Post]: Record<never, never>;
    [EndpointMethods.Put]: Record<never, never>;
    [EndpointMethods.Delete]: Record<never, never>;
    [EndpointMethods.Patch]: Record<never, never>;
  };
