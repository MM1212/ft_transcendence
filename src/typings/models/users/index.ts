import {
  Endpoint,
  EndpointMethod,
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  SseModel,
} from '@typings/api';
import { GroupEnumValues } from '@typings/utils';

namespace UsersModel {
  export namespace Models {
    export interface IUser {
      id: number;
      studentId: number;
      nickname: string;
      avatar: string;
      createdAt: number;
      friends: number[];
      chats: number[];
    }
    export interface IUserInfo extends Omit<IUser, 'friends' | 'chats'> {}
  }
  export namespace DTO {
    export namespace DB {
      export interface IUser extends Omit<Models.IUserInfo, 'createdAt'> {
        createdAt: Date;
        friends: { id: number }[];
        friendOf: { id: number }[];
        chats: { id: number }[];
      }
      export interface IUserInfo extends Omit<Models.IUserInfo, 'createdAt'> {
        createdAt: Date;
      }
      export interface IUserCreate
        extends Pick<Models.IUserInfo, 'studentId' | 'nickname' | 'avatar'> {}
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
    }
    export type PatchUser = Partial<
      Pick<Models.IUserInfo, 'nickname' | 'avatar'>
    >;

    export interface SseUserUpdate extends Models.IUserInfo {}
  }
  export namespace Endpoints {
    export enum Targets {
      GetUsers = '/users',
      GetUser = '/users/:id',
      SearchUsers = '/users/search',
      PatchUser = '/users/:id',
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
        DTO.PatchUser,
        PatchUser,
        { id: number }
      > {}

    export type Registry = {
      [EndpointMethods.Get]: {
        [Targets.GetUsers]: GetUsers;
        [Targets.GetUser]: GetUser;
      };
      [EndpointMethods.Post]: {
        [Targets.SearchUsers]: SearchUsers;
      };
      [EndpointMethods.Patch]: {
        [Targets.PatchUser]: PatchUser;
      };
    };
  }
  export namespace Sse {
    export enum Events {
      UserUpdated = 'users.userUpdated'
    }
    export interface UserUpdatedEvent
      extends SseModel.Models.Event<DTO.SseUserUpdate, Events.UserUpdated> {}
  }
}

export default UsersModel;
