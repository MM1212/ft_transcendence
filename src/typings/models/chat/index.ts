import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
  SseModel,
} from '@typings/api';
import { GroupEnumValues } from '@typings/utils';
import UsersModel from '../users';

namespace ChatsModel {
  export namespace Models {
    export const MAX_MESSAGES_PER_CHAT = 50;
    export enum ChatType {
      Temp = 'TEMP',
      Group = 'GROUP',
      Direct = 'DIRECT',
    }
    export enum ChatAccess {
      Public = 'PUBLIC',
      Protected = 'PROTECTED',
      Private = 'PRIVATE',
    }
    export enum ChatParticipantRole {
      Owner = 'OWNER',
      Admin = 'ADMIN',
      Member = 'MEMBER',
      Banned = 'BANNED',
      Left = 'LEFT',
    }
    export enum ChatMessageType {
      Normal = 'NORMAL',
      Embed = 'EMBED',
    }

    export enum ChatParticipantMuteType {
      No = 'NO',
      Forever = 'FOREVER',
      Until = 'UNTIL',
    }

    export interface IChatParticipant {
      id: number;
      chatId: number;
      userId: number;
      role: GroupEnumValues<ChatParticipantRole>;
      toReadPings: number;
      createdAt: number;
      muted: GroupEnumValues<ChatParticipantMuteType>;
      mutedUntil: number | null;
      typing: boolean;
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
        urls: string[];
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
        inviteNonce: string;
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
      extends Omit<IChat, 'messages' | 'authorizationData' | 'participants'> {
      participantsCount: number;
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface ChatMessage
        extends Omit<Models.IChatMessage, 'createdAt' | 'meta'> {
        createdAt: Date;
        meta: any;
      }
      export interface ChatParticipant
        extends Omit<
          Models.IChatParticipant,
          'createdAt' | 'mutedUntil' | 'typing'
        > {
        createdAt: Date;
        mutedUntil: Date | null;
      }
      export interface Chat
        extends Omit<Models.IChat, 'participants' | 'createdAt' | 'messages'> {
        createdAt: Date;
        authorizationData: any;
        participants?: ChatParticipant[];
        messages?: ChatMessage[];
      }
      export interface GetChat extends Models.IChatDisplay {}
      export type GetChatParticipants = Models.IChatParticipant[];
      export type GetChatMessages = Models.IChatMessage[];
      export type GetUserChats = Models.IChat[];
      export type GetPublicChats = Models.IChatInfo[];
      export interface CreateDBParticipant
        extends Pick<Models.IChatParticipant, 'role' | 'userId' | 'chatId'> {}
      export interface CreateChat
        extends Pick<
          Models.IChat,
          'type' | 'authorization' | 'name' | 'photo' | 'topic'
        > {
        authorizationData: Models.IChatAuthorizationData | null;
        participants: Omit<CreateDBParticipant, 'chatId'>[];
      }
      export interface CreateMessage
        extends Pick<
          Models.IChatMessage,
          'type' | 'message' | 'meta' | 'chatId' | 'authorId'
        > {}
      export interface UpdateChatInfo
        extends Pick<
          Partial<Models.IChat>,
          'name' | 'photo' | 'authorization' | 'authorizationData' | 'topic'
        > {}
      export interface UpdateParticipant
        extends Pick<
          Partial<Models.IChatParticipant>,
          'role' | 'toReadPings' | 'muted' | 'mutedUntil'
        > {}
      export interface UpdateMessage
        extends Pick<
          Partial<Models.IChatMessage>,
          'type' | 'message' | 'meta'
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
    export interface UpdateParticipant extends DTO.DB.UpdateParticipant {
      typing: boolean;
    }

    export interface CheckOrCreateDirectChat {
      exists: boolean;
      chatId: number;
    }

    export interface CheckOrCreateDirectChatParams
      extends Record<string, unknown> {
      targetId: number;
    }

    export interface TransferOwnership {
      targetParticipantId: number;
    }
    export interface MuteParticipant {
      until?: number;
    }

    export interface SendInviteToTarget {
      type: 'user' | 'chat';
      id: number;
    }

    export interface JoinChat {
      password?: string;
      messageData?: {
        id: number;
        nonce: string;
      };
      returnChatInfo?: boolean;
    }
  }
  export namespace Endpoints {
    export enum Targets {
      GetChat = '/chats/:chatId',
      GetChatInfo = '/chats/:chatId/info',
      GetChatParticipants = '/chats/:chatId/participants',
      GetChatMessages = '/chats/:chatId/messages',
      GetChatMessage = '/chats/:chatId/messages/:messageId',
      GetUserChats = '/users/:id/chats',
      GetSessionChats = '/chats',
      GetPublicChats = '/chats/public',
      CheckOrCreateDirectChat = '/chats/direct/:targetId',
      CreateChat = '/chats',
      CreateMessage = '/chats/:chatId/messages',
      UpdateChatInfo = '/chats/:chatId',
      UpdateParticipant = '/chats/:chatId/participants/:participantId',
      UpdateMessage = '/chats/:chatId/messages/:messageId',
      DeleteChat = '/chats/:chatId',
      DeleteParticipant = '/chats/:chatId/participants/:participantId',
      BanParticipant = '/chats/:chatId/participants/:participantId/ban',
      UnbanParticipant = '/chats/:chatId/participants/:participantId/ban',
      MuteParticipant = '/chats/:chatId/participants/:participantId/mute',
      LeaveChat = '/chats/:chatId/leave',
      DeleteMessage = '/chats/:chatId/messages/:messageId',
      TransferOwnership = '/chats/:chatId/transfer',
      SendInviteToTargets = '/chats/:chatId/invite',
      SetTyping = '/chats/:chatId/typing',
      JoinChat = '/chats/:chatId/join',
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetChats
      extends GetEndpoint<Targets.GetSessionChats, number[], DTO.ChatParams> {}
    export interface GetChat
      extends GetEndpoint<
        Targets.GetChat,
        Models.IChatDisplay,
        DTO.ChatParams
      > {}
    export interface GetChatInfo
      extends GetEndpoint<
        Targets.GetChatInfo,
        Models.IChatInfo,
        DTO.ChatParams
      > {}
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
        number,
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
    export interface BanParticipant
      extends Endpoint<
        EndpointMethods.Post,
        Targets.BanParticipant,
        undefined,
        undefined,
        DTO.ChatParticipantParams
      > {}
    export interface UnbanParticipant
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.UnbanParticipant,
        undefined,
        undefined,
        DTO.ChatParticipantParams
      > {}
    export interface MuteParticipant
      extends Endpoint<
        EndpointMethods.Post,
        Targets.MuteParticipant,
        undefined,
        DTO.MuteParticipant,
        DTO.ChatParticipantParams
      > {}
    export interface DeleteMessage
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.DeleteMessage,
        undefined,
        DTO.ChatMessageParams
      > {}

    export interface CheckOrCreateDirectChat
      extends Endpoint<
        EndpointMethods.Post,
        Targets.CheckOrCreateDirectChat,
        DTO.CheckOrCreateDirectChat,
        undefined,
        DTO.CheckOrCreateDirectChatParams
      > {}

    export interface LeaveChat
      extends Endpoint<
        EndpointMethods.Post,
        Targets.LeaveChat,
        undefined,
        undefined,
        DTO.ChatParams
      > {}

    export interface TransferOwnership
      extends Endpoint<
        EndpointMethods.Post,
        Targets.TransferOwnership,
        undefined,
        DTO.TransferOwnership,
        DTO.ChatParams
      > {}

    export interface SendInviteToTargets
      extends Endpoint<
        EndpointMethods.Post,
        Targets.SendInviteToTargets,
        undefined,
        DTO.SendInviteToTarget[],
        DTO.ChatParams
      > {}

    export interface SetTyping
      extends Endpoint<
        EndpointMethods.Put,
        Targets.SetTyping,
        undefined,
        { state?: boolean },
        DTO.ChatParams
      > {}

    export interface JoinChat
      extends Endpoint<
        EndpointMethods.Post,
        Targets.JoinChat,
        Models.IChatDisplay | undefined,
        DTO.JoinChat,
        DTO.ChatParams
      > {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetSessionChats]: GetChats;
        [Targets.GetChat]: GetChat;
        [Targets.GetChatInfo]: GetChatInfo;
        [Targets.GetChatParticipants]: GetChatParticipants;
        [Targets.GetChatMessages]: GetChatMessages;
        [Targets.GetChatMessage]: GetChatMessage;
        [Targets.GetUserChats]: GetUserChats;
        [Targets.GetPublicChats]: GetPublicChats;
      };
      [EndpointMethods.Post]: {
        [Targets.CheckOrCreateDirectChat]: CheckOrCreateDirectChat;
        [Targets.BanParticipant]: BanParticipant;
        [Targets.LeaveChat]: LeaveChat;
        [Targets.TransferOwnership]: TransferOwnership;
        [Targets.MuteParticipant]: MuteParticipant;
        [Targets.SendInviteToTargets]: SendInviteToTargets;
        [Targets.JoinChat]: JoinChat;
      };
      [EndpointMethods.Put]: {
        [Targets.CreateChat]: CreateChat;
        [Targets.CreateMessage]: CreateMessage;
        [Targets.SetTyping]: SetTyping;
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
        [Targets.UnbanParticipant]: UnbanParticipant;
      };
    }
  }
  export namespace Sse {
    export enum Events {
      NewMessage = 'chat.new-message',
      NewChat = 'chat.new-chat',
      UpdateParticipant = 'chat.update-participant',
      UpdateChatInfo = 'chat.update-chat-info',
    }
    export interface AddParticipant {
      type: 'add';
      participant: Models.IChatParticipant;
    }
    export interface UpdateParticipant {
      type: 'update';
      participant: Partial<DTO.UpdateParticipant>;
    }
    export interface RemoveParticipant {
      type: 'remove';
      participantId: number;
      banned: boolean;
    }
    export interface UpdateChatInfo extends DTO.DB.UpdateChatInfo {}
    export interface NewMessageEvent
      extends SseModel.Models.Event<Models.IChatMessage, Events.NewMessage> {}
    export interface NewChatEvent
      extends SseModel.Models.Event<{ chatId: number }, Events.NewChat> {}
    export interface UpdateParticipantEvent
      extends SseModel.Models.Event<
        (AddParticipant | UpdateParticipant | RemoveParticipant) & {
          chatId: number;
          participantId: number;
        },
        Events.UpdateParticipant
      > {}
    export interface UpdateChatInfoEvent
      extends SseModel.Models.Event<
        UpdateChatInfo & {
          chatId: number;
        },
        Events.UpdateChatInfo
      > {}
  }
}

export default ChatsModel;
