import {
  AuthModel,
  Endpoint,
  EndpointMethod,
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  SseModel,
} from '@typings/api';
import { GroupEnumValues } from '@typings/utils';
import LobbyModel from '../lobby';
import QuestsModel from './quests';
import InventoryModel from './inventory';
import NotificationsModel from '../notifications';

namespace UsersModel {
  export namespace Models {
    export const DEFAULT_AVATAR = '13';
    export enum Status {
      Offline = "OFFLINE",
      Online = "ONLINE",
      Busy = "BUSY",
      Away = "AWAY",
    }
    export interface ICharacter {
      id: number;
      clothes: Record<LobbyModel.Models.InventoryCategory, number>;
    }
    export interface IUser {
      id: number;
      studentId: number;
      nickname: string;
      avatar: string;
      createdAt: number;
      status: GroupEnumValues<Status>;
      storedStatus: Status;
      firstLogin: boolean;
      friends: number[];
      blocked: number[];
      chats: number[];
      tfa: AuthModel.Models.TFA;
      connected: boolean;
      character: ICharacter;
      quests: QuestsModel.Models.IQuest[];
      inventory: InventoryModel.Models.IItem[];
      notifications: NotificationsModel.Models.INotification[];
      credits: number;
    }
    export interface IUserInfo
      extends Omit<
        IUser,
        | 'friends'
        | 'blocked'
        | 'chats'
        | 'storedStatus'
        | 'tfa'
        | 'connected'
        | 'character'
        | 'quests'
        | 'inventory'
        | 'notifications'
      > {}
  }
  export namespace DTO {
    export namespace DB {
      export interface IUser
        extends Omit<Models.IUserInfo, 'createdAt' | 'status'> {
        createdAt: Date;
        friends: { id: number }[];
        friendOf: { id: number }[];
        chats: { id: number }[];
        blocked: { id: number }[];
        storedStatus: Models.Status;
        tfaEnabled: boolean;
        tfaSecret: string | null;

        quests: QuestsModel.DTO.DB.IQuest[];
        inventory: InventoryModel.DTO.DB.IItem[];
        notifications: NotificationsModel.DTO.DB.Notification[];
      }
      export interface IUserInfo
        extends Omit<Models.IUserInfo, 'createdAt' | 'status'> {
        createdAt: Date;
      }
      export interface IUserCreate
        extends Pick<Models.IUserInfo, 'studentId' | 'nickname' | 'avatar'> {
        credits?: number;
        inventory?: Omit<InventoryModel.DTO.DB.CreateItem,'userId'>[];
      }
      export interface GetLimits {
        limit?: number;
        offset?: number;
      }
    }

    export type GetUsers = Models.IUserInfo[];
    export interface GetUsersParams extends Record<string, unknown> {
      limit?: number;
      offset?: number;
    }
    export type GetUser = Models.IUserInfo;
    export interface GetUserParams extends Record<string, unknown> {
      id: number;
    }
    export interface SearchUsersParams extends Record<string, unknown> {
      query: string;
      exclude?: number[];
      excluseSelf?: boolean;
    }
    export type PatchUser = Partial<
      Pick<Models.IUserInfo, 'nickname' | 'avatar' | 'status' | 'firstLogin'>
    >;

    export interface SseUserUpdate
      extends Partial<Omit<Models.IUserInfo, 'id'>> {
      id: number;
    }

    export interface FriendsParams extends GetUserParams {
      friendId: number;
    }

    export interface BlockedParams extends GetUserParams {
      blockedId: number;
    }

    export interface SseFriendsUpdater {
      type: 'add' | 'remove';
      id: number;
    }
    export interface SseFriendsUpdate {
      friends?: SseFriendsUpdater[];
      blocked?: SseFriendsUpdater[];
    }

    export interface FriendRequestNotification
      extends NotificationsModel.Models.INotification<
        {
          type: 'sender' | 'receiver';
          uId: number;
          status: 'pending' | 'accepted' | 'declined';
        }
      > {}
  }
  export namespace Endpoints {
    export enum Targets {
      GetUsers = '/users',
      GetUser = '/users/:id',
      SearchUsers = '/users/search',
      PatchUser = '/users/:id',
      GetFriends = '/users/:id/friends',
      GetSessionFriends = '/me/friends',
      GetBlocked = '/users/:id/blocked',
      GetSessionBlocked = '/me/blocked',
      AddFriend = '/users/:id/friends/:friendId',
      AddFriendByName = '/users/:id/friends',
      RemoveFriend = '/users/:id/friends/:friendId',
      BlockUser = '/users/:id/blocked/:blockedId',
      UnblockUser = '/users/:id/blocked/:blockedId',
      GetCredits = '/users/:id/credits',
    }

    export type All = GroupEnumValues<Targets>;

    export interface GetUsers
      extends GetEndpoint<Targets.GetUsers, DTO.GetUsers, DTO.GetUsersParams> {}
    export interface GetUser
      extends GetEndpoint<Targets.GetUser, DTO.GetUser, DTO.GetUserParams> {}

    export interface SearchUsers
      extends Endpoint<
        EndpointMethods.Post,
        Targets.SearchUsers,
        DTO.GetUsers,
        DTO.SearchUsersParams
      > {}

    export interface PatchUser
      extends Endpoint<
        EndpointMethods.Patch,
        Targets.PatchUser,
        Models.IUserInfo,
        DTO.PatchUser,
        { id: number }
      > {}

    export interface GetFriends
      extends GetEndpoint<Targets.GetFriends, number[], DTO.GetUserParams> {}
    export interface GetSessionFriends
      extends GetEndpoint<Targets.GetSessionFriends, number[]> {}

    export interface GetBlocked
      extends GetEndpoint<Targets.GetBlocked, number[], DTO.GetUserParams> {}
    export interface GetSessionBlocked
      extends GetEndpoint<Targets.GetSessionBlocked, number[]> {}
    export interface AddFriend
      extends Endpoint<
        EndpointMethods.Put,
        Targets.AddFriend,
        undefined,
        undefined,
        DTO.FriendsParams
      > {}
    export interface AddFriendByName
      extends Endpoint<
        EndpointMethods.Post,
        Targets.AddFriendByName,
        undefined,
        { nickname: string },
        DTO.GetUserParams
      > {}

    export interface RemoveFriend
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.RemoveFriend,
        undefined,
        undefined,
        DTO.FriendsParams
      > {}

    export interface BlockUser
      extends Endpoint<
        EndpointMethods.Put,
        Targets.BlockUser,
        undefined,
        undefined,
        DTO.BlockedParams
      > {}

    export interface UnblockUser
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.UnblockUser,
        undefined,
        undefined,
        DTO.BlockedParams
      > {}

    export interface GetCredits
      extends GetEndpoint<Targets.GetCredits, number, DTO.GetUserParams> {}
    export type Registry = {
      [EndpointMethods.Get]: {
        [Targets.GetUsers]: GetUsers;
        [Targets.GetUser]: GetUser;
        [Targets.GetFriends]: GetFriends;
        [Targets.GetBlocked]: GetBlocked;
        [Targets.GetSessionFriends]: GetSessionFriends;
        [Targets.GetSessionBlocked]: GetSessionBlocked;
        [Targets.GetCredits]: GetCredits;
      };
      [EndpointMethods.Post]: {
        [Targets.SearchUsers]: SearchUsers;
        [Targets.AddFriendByName]: AddFriendByName;
      };
      [EndpointMethods.Put]: {
        [Targets.AddFriend]: AddFriend;
        [Targets.BlockUser]: BlockUser;
      };
      [EndpointMethods.Patch]: {
        [Targets.PatchUser]: PatchUser;
      };
      [EndpointMethods.Delete]: {
        [Targets.RemoveFriend]: RemoveFriend;
        [Targets.UnblockUser]: UnblockUser;
      };
    };
  }
  export namespace Sse {
    export enum Events {
      UserUpdated = 'users.userUpdated',
      UserFriendsUpdated = 'users.user.friendsUpdated',
    }
    export interface UserUpdatedEvent
      extends SseModel.Models.Event<DTO.SseUserUpdate, Events.UserUpdated> {}

    export interface UserFriendsUpdatedEvent
      extends SseModel.Models.Event<
        DTO.SseFriendsUpdate,
        Events.UserFriendsUpdated
      > {}
  }
}

export default UsersModel;
