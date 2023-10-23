import { GroupEndpoints } from '@typings/api';
import { IUser } from '@typings/user';
import { GroupEnumValues } from '@typings/utils';

namespace ChatModel {
  export namespace Models {
    export enum ChatType {
      Temp = 'TEMP',
      Group = 'GROUP',
      Direct = 'DIRECT',
    }
    export enum ChatAccess {
      Public = 'PUBLIC',
      Private = 'PRIVATE',
    }
    export enum ChatParticipantRole {
      Owner = 'OWNER',
      Admin = 'ADMIN',
      Member = 'MEMBER',
      Banned = 'BANNED',
    }
    export enum ChatMessageType {
      Normal = 'NORMAL',
      Embed = 'EMBED',
    }

    export interface IChatParticipant {
      id: number;
      chatId: number;
      user: IUser;
      userId: number;
      role: GroupEnumValues<ChatParticipantRole>;
      toReadPings: number;
      createdAt: number;
    }

    export interface IChatAuthorizationData {
      password?: string;
    }

    export namespace Embeds {
      export enum Type {
        Media = 'media',
        UserProfile = 'user-profile',
        GameInvite = 'game-invite',
        ChatInvite = 'chat-invite',
      }
      export interface Media {
        type: GroupEnumValues<Type.Media>;
        url: string;
      }
      export interface UserProfile {
        type: GroupEnumValues<Type.UserProfile>;
        userId: number;
      }
      export interface GameInvite {
        type: GroupEnumValues<Type.GameInvite>;
        gameId: number;
      }
      export interface ChatInvite {
        type: GroupEnumValues<Type.ChatInvite>;
        chatId: number;
      }
      export type All = Media | UserProfile | GameInvite | ChatInvite;
    }

    export interface IChatMessage {
      id: number;
      chatId: number;
      type: GroupEnumValues<ChatMessageType>;
      message: string;
      meta: Partial<Embeds.All>;
      authorId: number;
      createdAt: number;
    }

    export interface IChat {
      id: number;
      type: GroupEnumValues<ChatType>;
      authorization: GroupEnumValues<ChatAccess>;
      authorizationData: IChatAuthorizationData | null;
      name: string;
      photo: string | null;
      participants: IChatParticipant[];
      messages: IChatMessage[];
      createdAt: number;
    }

    export interface IChatDisplay extends Omit<IChat, 'participants'> {}

    export interface IChatSimple
      extends Omit<IChat, 'participants' | 'messages'> {
      participants: Omit<IChatParticipant, 'user'>[];
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface GetChat extends Models.IChatDisplay {}
      export type GetChatParticipants = Models.IChatParticipant[];
      export type GetChatMessages = Models.IChatMessage[];
      export type GetUserChats = Models.IChat[];
      export type GetPublicChats = Models.IChatSimple[];
      export interface CreateDBParticipant
        extends Pick<Models.IChatParticipant, 'role' | 'userId' | 'chatId'> {}
      export interface CreateChat
        extends Pick<
          Models.IChat,
          'type' | 'authorization' | 'name' | 'photo'
        > {
        authorizationData: Models.IChatAuthorizationData | null;
        participants: CreateDBParticipant[];
      }
      export interface CreateMessage
        extends Pick<
          Models.IChatMessage,
          'type' | 'message' | 'meta' | 'chatId'
        > {
        authorId: number;
      }
      export interface UpdateChatInfo
        extends Pick<
          Partial<Models.IChat>,
          'name' | 'photo' | 'authorization' | 'authorizationData'
        > {}
      export interface UpdateParticipant
        extends Pick<
          Partial<Models.IChatParticipant>,
          'role' | 'toReadPings'
        > {}
      export interface UpdateMessage
        extends Pick<
          Partial<Models.IChatMessage>,
          'type' | 'message' | 'meta'
        > {}
    }
  }
  export namespace Endpoints {
    export enum Targets {
      A = 'b',
    }
    export type All = GroupEndpoints<Targets>;
  }
  export namespace Sse {}
}

export default ChatModel;
