import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/db/prisma';
import { ChatModel } from '@typings/api/models';
import { IUser } from '@typings/user';
import { JsonObject } from '@prisma/client/runtime/library';

const SIMPLE_DB_USER: Record<keyof IUser, true> = {
  id: true,
  nickname: true,
  avatar: true,
  studentId: true,
  createdAt: true,
};
const SIMPLE_DB_CHAT_PARTICIPANT: Record<
  Exclude<keyof ChatModel.Models.IChatParticipant, 'user'>,
  true
> = {
  userId: true,
  role: true,
  chatId: true,
  createdAt: true,
  id: true,
  toReadPings: true,
};

@Injectable()
export class Chats {
  constructor(private readonly prisma: PrismaService) {}

  public async get(chatId: number): Promise<ChatModel.Models.IChat | null> {
    return (await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        messages: {
          take: 50,
        },
        participants: {
          where: {
            NOT: {
              role: ChatModel.Models.ChatParticipantRole.Banned,
            },
          },
          select: {
            user: {
              select: SIMPLE_DB_USER,
            },
          },
        },
        authorization: true,
        createdAt: true,
        id: true,
        name: true,
        photo: true,
        type: true,
      } satisfies Record<
        Exclude<keyof ChatModel.Models.IChat, 'authorizationData'>,
        unknown
      >,
    })) as unknown as ChatModel.Models.IChat | null;
  }
  public async getChatInfo(
    chatId: number,
  ): Promise<ChatModel.Models.IChatSimple | null> {
    return (await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        name: true,
        photo: true,
        type: true,
        authorization: true,
        participants: {
          select: SIMPLE_DB_CHAT_PARTICIPANT,
        },
      },
    })) as unknown as ChatModel.Models.IChatSimple | null;
  }
  public async getChatsByParticipantUserId(
    userId: number,
  ): Promise<ChatModel.Models.IChatSimple[]> {
    return (await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        photo: true,
        type: true,
        authorization: true,
        participants: {
          select: SIMPLE_DB_CHAT_PARTICIPANT,
        },
      },
    })) as unknown as ChatModel.Models.IChatSimple[];
  }
  public async getChatsDisplayForUserId(
    userId: number,
  ): Promise<ChatModel.Models.IChatDisplay[]> {
    return (await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        photo: true,
        type: true,
        authorization: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            type: true,
            message: true,
            createdAt: true,
            authorId: true,
            meta: true,
            chatId: true,
          } satisfies Record<keyof ChatModel.Models.IChatMessage, unknown>,
        },
      },
    })) as unknown as ChatModel.Models.IChatDisplay[];
  }
  public async getAllChatParticipants(
    chatId: number,
  ): Promise<ChatModel.Models.IChatParticipant[] | null> {
    return (await this.prisma.chatParticipant.findMany({
      where: {
        chatId,
      },
      select: {
        ...SIMPLE_DB_CHAT_PARTICIPANT,
        user: {
          select: SIMPLE_DB_USER satisfies Record<keyof IUser, true>,
        },
      } satisfies Record<keyof ChatModel.Models.IChatParticipant, unknown>,
    })) as unknown as ChatModel.Models.IChatParticipant[];
  }
  public async getAllPublicChats(): Promise<ChatModel.Models.IChatSimple[]> {
    return (await this.prisma.chat.findMany({
      where: {
        authorization: ChatModel.Models.ChatAccess.Public,
      },
      select: {
        id: true,
        name: true,
        photo: true,
        type: true,
        authorization: true,
        participants: {
          select: SIMPLE_DB_CHAT_PARTICIPANT,
        },
      },
    })) as unknown as ChatModel.Models.IChatSimple[];
  }
  /**
   *
   * @param chatId
   * @param cursor The last message id to start from (exclusive) Improves performance for infinite scroll cases.
   * @returns
   */
  public async getChatMessages(
    chatId: number,
    cursor?: number,
  ): Promise<ChatModel.Models.IChatMessage[]> {
    return (await this.prisma.chatMessage.findMany({
      take: 50,
      skip: cursor ? 1 : 0,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
      select: {
        id: true,
        message: true,
        type: true,
        meta: true,
        createdAt: true,
        authorId: true,
        chatId: true,
      },
      where: {
        chatId,
      },
    })) as unknown as ChatModel.Models.IChatMessage[];
  }
  public async getChatMessage(
    messageId: number,
  ): Promise<ChatModel.Models.IChatMessage | null> {
    return (await this.prisma.chatMessage.findUnique({
      where: {
        id: messageId,
      },
      include: {
        author: {
          select: SIMPLE_DB_USER,
        },
      },
    })) as unknown as ChatModel.Models.IChatMessage | null;
  }
  public async getChatParticipant(
    chatId: number,
    userId: number,
  ): Promise<ChatModel.Models.IChatParticipant | null>;
  public async getChatParticipant(
    participantId: number,
  ): Promise<ChatModel.Models.IChatParticipant | null>;
  public async getChatParticipant(
    chatIdOrParticipantId: number,
    userId?: number,
  ): Promise<ChatModel.Models.IChatParticipant | null> {
    return (await this.prisma.chatParticipant.findUnique({
      where:
        typeof userId === 'number'
          ? {
              chat_participant_unique: {
                chatId: chatIdOrParticipantId,
                userId,
              },
            }
          : {
              id: chatIdOrParticipantId,
            },
      select: {
        ...SIMPLE_DB_CHAT_PARTICIPANT,
        user: {
          select: SIMPLE_DB_USER satisfies Record<keyof IUser, true>,
        },
      } satisfies Record<keyof ChatModel.Models.IChatParticipant, unknown>,
    })) as unknown as ChatModel.Models.IChatParticipant | null;
  }
  public async createChat({
    participants,
    ...data
  }: ChatModel.DTO.DB.CreateChat): Promise<ChatModel.Models.IChat> {
    return (await this.prisma.chat.create({
      data: {
        ...data,
        participants: {
          createMany: {
            data: participants,
          },
        },
        authorizationData: data.authorizationData as JsonObject,
      },
    })) as unknown as ChatModel.Models.IChat;
  }
  public async createChatMessage(
    data: ChatModel.DTO.DB.CreateMessage,
  ): Promise<ChatModel.Models.IChatMessage> {
    return (await this.prisma.chatMessage.create({
      data,
    })) as unknown as ChatModel.Models.IChatMessage;
  }
  public async createChatParticipant(
    data: ChatModel.DTO.DB.CreateDBParticipant,
  ): Promise<ChatModel.Models.IChatParticipant> {
    return (await this.prisma.chatParticipant.create({
      data,
    })) as unknown as ChatModel.Models.IChatParticipant;
  }
  public async updateChatInfo(
    chatId: number,
    data: ChatModel.DTO.DB.UpdateChatInfo,
  ): Promise<ChatModel.Models.IChat> {
    return (await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        ...data,
        authorizationData: data.authorizationData as JsonObject,
      },
    })) as unknown as ChatModel.Models.IChat;
  }
  public async updateChatParticipant(
    participantId: number,
    data: ChatModel.DTO.DB.UpdateParticipant,
  ): Promise<Omit<ChatModel.Models.IChatParticipant, 'user'>> {
    return (await this.prisma.chatParticipant.update({
      where: {
        id: participantId,
      },
      data,
    })) as unknown as Omit<ChatModel.Models.IChatParticipant, 'user'>;
  }
  public async updateChatMessage(
    messageId: number,
    data: ChatModel.DTO.DB.UpdateMessage,
  ): Promise<ChatModel.Models.IChatMessage> {
    return (await this.prisma.chatMessage.update({
      where: {
        id: messageId,
      },
      data,
    })) as unknown as ChatModel.Models.IChatMessage;
  }
  public async deleteChatMessage(
    messageId: number,
  ): Promise<ChatModel.Models.IChatMessage> {
    return (await this.prisma.chatMessage.delete({
      where: {
        id: messageId,
      },
    })) as unknown as ChatModel.Models.IChatMessage;
  }
  public async deleteChatParticipant(
    participantId: number,
  ): Promise<ChatModel.Models.IChatParticipant> {
    return (await this.prisma.chatParticipant.delete({
      where: {
        id: participantId,
      },
    })) as unknown as ChatModel.Models.IChatParticipant;
  }
  public async deleteChat(chatId: number): Promise<ChatModel.Models.IChat> {
    return (await this.prisma.chat.delete({
      where: {
        id: chatId,
      },
    })) as unknown as ChatModel.Models.IChat;
  }
}
