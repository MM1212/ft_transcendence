import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
  SseModel,
} from "@typings/api";
import { GroupEnumValues } from "@typings/utils";
import UsersModel from "../users";

namespace ChatsModel {
  export namespace Models {
    export const MAX_MESSAGES_PER_CHAT = 50;
    export enum ChatType {
      Temp = "TEMP",
      Group = "GROUP",
      Direct = "DIRECT",
    }
    export enum ChatAccess {
      Public = "PUBLIC",
      Private = "PRIVATE",
    }
    export enum ChatParticipantRole {
      Owner = "OWNER",
      Admin = "ADMIN",
      Member = "MEMBER",
      Banned = "BANNED",
      Left = "LEFT",
    }
    export enum ChatMessageType {
      Normal = "NORMAL",
      Embed = "EMBED",
    }

    export interface IChatParticipant {
      id: number;
      chatId: number;
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
        Media = "media",
        UserProfile = "user-profile",
        GameInvite = "game-invite",
        ChatInvite = "chat-invite",
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
      topic: string;
      photo: string | null;
      participants: IChatParticipant[];
      messages: IChatMessage[];
      createdAt: number;
    }

    export interface IChatDisplay extends Omit<IChat, 'authorizationData'> {}

    export interface IChatInfo
      extends Omit<IChat, 'messages' | 'authorizationData'> {}
  }
  export namespace DTO {
    export namespace DB {
      export interface ChatMessage
        extends Omit<Models.IChatMessage, "createdAt" | "meta"> {
        createdAt: Date;
        meta: any;
      }
      export interface ChatParticipant
        extends Omit<Models.IChatParticipant, "createdAt"> {
        createdAt: Date;
      }
      export interface Chat
        extends Omit<Models.IChat, "participants" | "createdAt" | "messages"> {
        createdAt: Date;
        authorizationData: any;
        participants: ChatParticipant[];
        messages: ChatMessage[];
      }
      export interface GetChat extends Models.IChatDisplay {}
      export type GetChatParticipants = Models.IChatParticipant[];
      export type GetChatMessages = Models.IChatMessage[];
      export type GetUserChats = Models.IChat[];
      export type GetPublicChats = Models.IChatInfo[];
      export interface CreateDBParticipant
        extends Pick<Models.IChatParticipant, "role" | "userId" | "chatId"> {}
      export interface CreateChat
        extends Pick<
          Models.IChat,
          "type" | "authorization" | "name" | "photo" | "topic"
        > {
        authorizationData: Models.IChatAuthorizationData | null;
        participants: Omit<CreateDBParticipant, "chatId">[];
      }
      export interface CreateMessage
        extends Pick<
          Models.IChatMessage,
          "type" | "message" | "meta" | "chatId" | "authorId"
        > {}
      export interface UpdateChatInfo
        extends Pick<
          Partial<Models.IChat>,
          "name" | "photo" | "authorization" | "authorizationData"
        > {}
      export interface UpdateParticipant
        extends Pick<
          Partial<Models.IChatParticipant>,
          "role" | "toReadPings"
        > {}
      export interface UpdateMessage
        extends Pick<
          Partial<Models.IChatMessage>,
          "type" | "message" | "meta"
        > {}
    }
    export interface ChatParams extends Record<string, unknown> {
      chatId: number;
    }
    export interface ChatMessagesParams extends ChatParams {
      cursor: number;
    }
    export interface ChatMessageParams extends ChatParams {
      messageId: number;
    }
    export interface ChatParticipantParams extends ChatParams {
      participantId: number;
    }
    export interface NewChat extends DB.CreateChat {}
    export interface NewMessage
      extends Omit<DB.CreateMessage, 'authorId' | 'chatId'> {}
    export interface UpdateParticipant
      extends DTO.DB.UpdateParticipant {}
  }
  export namespace Endpoints {
    export enum Targets {
      GetChat = "/chats/:chatId",
      GetChatParticipants = "/chats/:chatId/participants",
      GetChatMessages = "/chats/:chatId/messages",
      GetChatMessage = "/chats/:chatId/messages/:messageId",
      GetUserChats = "/users/:id/chats",
      GetSessionChats = "/chats",
      GetPublicChats = "/chats/public",
      CreateChat = "/chats",
      CreateMessage = "/chats/:chatId/messages",
      UpdateChatInfo = "/chats/:chatId",
      UpdateParticipant = "/chats/:chatId/participants/:participantId",
      UpdateMessage = "/chats/:chatId/messages/:messageId",
      DeleteChat = "/chats/:chatId",
      DeleteParticipant = "/chats/:chatId/participants/:participantId",
      DeleteMessage = "/chats/:chatId/messages/:messageId",
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetChats
      extends GetEndpoint<
        Targets.GetSessionChats,
        Models.IChatDisplay[],
        DTO.ChatParams
      > {}
    export interface GetChat
      extends GetEndpoint<Targets.GetChat, Models.IChatInfo, DTO.ChatParams> {}
    export interface GetChatParticipants
      extends GetEndpoint<
        Targets.GetChatParticipants,
        Models.IChatParticipant[],
        DTO.ChatParams
      > {}
    export interface GetChatMessages
      extends GetEndpoint<
        Targets.GetChatMessages,
        Models.IChatMessage[],
        DTO.ChatMessagesParams
      > {}
    export interface GetChatMessage
      extends GetEndpoint<
        Targets.GetChatMessage,
        Models.IChatMessage,
        DTO.ChatMessageParams
      > {}
    export interface GetUserChats
      extends GetEndpoint<
        Targets.GetUserChats,
        Models.IChatInfo[],
        UsersModel.DTO.GetUserParams
      > {}
    export interface CreateChat
      extends Endpoint<
        EndpointMethods.Put,
        Targets.CreateChat,
        Models.IChatInfo,
        DTO.NewChat
      > {}
    export interface CreateMessage
      extends Endpoint<
        EndpointMethods.Put,
        Targets.CreateMessage,
        Models.IChatMessage,
        DTO.NewMessage,
        DTO.ChatParams
      > {}
    export interface UpdateChatInfo
      extends Endpoint<
        EndpointMethods.Patch,
        Targets.UpdateChatInfo,
        undefined,
        DTO.DB.UpdateChatInfo,
        DTO.ChatParams
      > {}
    export interface UpdateParticipant
      extends Endpoint<
        EndpointMethods.Patch,
        Targets.UpdateParticipant,
        undefined,
        DTO.DB.UpdateParticipant,
        DTO.ChatParticipantParams
      > {}
    export interface UpdateMessage
      extends Endpoint<
        EndpointMethods.Patch,
        Targets.UpdateMessage,
        undefined,
        DTO.DB.UpdateMessage,
        DTO.ChatMessageParams
      > {}
    export interface DeleteChat
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.DeleteChat,
        undefined,
        undefined,
        DTO.ChatParams
      > {}
    export interface GetPublicChats
      extends GetEndpoint<Targets.GetPublicChats, Models.IChatInfo[]> {}
    export interface DeleteParticipant
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.DeleteParticipant,
        undefined,
        DTO.ChatParticipantParams
      > {}
    export interface DeleteMessage
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.DeleteMessage,
        undefined,
        DTO.ChatMessageParams
      > {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetSessionChats]: GetChats;
        [Targets.GetChat]: GetChat;
        [Targets.GetChatParticipants]: GetChatParticipants;
        [Targets.GetChatMessages]: GetChatMessages;
        [Targets.GetChatMessage]: GetChatMessage;
        [Targets.GetUserChats]: GetUserChats;
        [Targets.GetPublicChats]: GetPublicChats;
      };
      [EndpointMethods.Put]: {
        [Targets.CreateChat]: CreateChat;
        [Targets.CreateMessage]: CreateMessage;
      };
      [EndpointMethods.Patch]: {
        [Targets.UpdateChatInfo]: UpdateChatInfo;
        [Targets.UpdateParticipant]: UpdateParticipant;
        [Targets.UpdateMessage]: UpdateMessage;
      };
      [EndpointMethods.Delete]: {
        [Targets.DeleteChat]: DeleteChat;
        [Targets.DeleteParticipant]: DeleteParticipant;
        [Targets.DeleteMessage]: DeleteMessage;
      };
    }
  }
  export namespace Sse {
    export enum Events {
      NewMessage = "chat.new-message",
    }
    export interface NewMessageEvent
      extends SseModel.Models.Event<Models.IChatMessage, Events.NewMessage> {}
  }
}

export default ChatsModel;
