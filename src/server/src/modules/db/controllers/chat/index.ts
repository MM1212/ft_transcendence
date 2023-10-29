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

@Injectable()
export class Chats {
  constructor(private readonly prisma: PrismaService) {}

  public formatChat<T extends ChatModel.DTO.DB.Chat | null>(
    chat: T,
  ): T extends null ? ChatModel.Models.IChat | null : ChatModel.Models.IChat {
    if (!chat) return null as unknown as ChatModel.Models.IChat;
    return {
      ...chat,
      createdAt: chat.createdAt.getTime(),
      authorizationData: chat.authorizationData as JsonObject,
      participants: chat.participants.map((p) => ({
        ...p,
        createdAt: p.createdAt.getTime(),
      })),
      messages: [],
    };
  }
  public formatChatMessage<T extends ChatModel.DTO.DB.ChatMessage | null>(
    message: T,
  ): T extends null
    ? ChatModel.Models.IChatMessage | null
    : ChatModel.Models.IChatMessage {
    if (!message) return null as unknown as ChatModel.Models.IChatMessage;
    return {
      ...message,
      createdAt: message.createdAt.getTime(),
      meta: message.meta as JsonObject,
    };
  }
  public async get(chats: number[]): Promise<ChatModel.Models.IChat[]>;
  public async get(chatId: number): Promise<ChatModel.DTO.DB.Chat | null>;
  public async get(data: unknown): Promise<unknown> {
    if (Array.isArray(data))
      return await this.prisma.chat.findMany({
        where: {
          id: {
            in: data,
          },
        },
        include: {
          participants: true,
        },
      });
    return await this.prisma.chat.findUnique({
      where: { id: data as number },
      include: {
        participants: true,
      },
    });
  }

  public async getChatInfo(
    chatId: number,
  ): Promise<ChatModel.Models.IChatInfo | null> {
    return (await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true,
      },
    })) as unknown as ChatModel.Models.IChatInfo | null;
  }
  public async getChatsByParticipantUserId(
    userId: number,
  ): Promise<ChatModel.Models.IChatInfo[]> {
    return (await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: true,
      },
    })) as unknown as ChatModel.Models.IChatInfo[];
  }
  public async getChatsIdsForUserId(userId: number): Promise<number[]> {
    return (
      await this.prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
        },
      })
    ).map((chat) => chat.id);
  }
  public async getAllChatParticipants(
    chatId: number,
  ): Promise<ChatModel.Models.IChatParticipant[] | null> {
    return (await this.prisma.chatParticipant.findMany({
      where: {
        chatId,
      },
    })) as unknown as ChatModel.Models.IChatParticipant[];
  }
  public async getAllPublicChats(): Promise<ChatModel.Models.IChatInfo[]> {
    return (await this.prisma.chat.findMany({
      where: {
        authorization: ChatModel.Models.ChatAccess.Public,
      },
      include: {
        participants: true,
      },
    })) as unknown as ChatModel.Models.IChatInfo[];
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
    return (
      await this.prisma.chatMessage.findMany({
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
      })
    ).map(this.formatChatMessage.bind(this));
  }
  public async getChatMessage(
    messageId: number,
  ): Promise<ChatModel.Models.IChatMessage | null> {
    return this.formatChatMessage(
      await this.prisma.chatMessage.findUnique({
        where: {
          id: messageId,
        },
        include: {
          author: {
            select: SIMPLE_DB_USER,
          },
        },
      }),
    );
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
    })) as unknown as ChatModel.Models.IChatParticipant | null;
  }
  public async createChat({
    participants,
    ...data
  }: ChatModel.DTO.DB.CreateChat): Promise<ChatModel.Models.IChat> {
    return this.formatChat(
      await this.prisma.chat.create({
        data: {
          ...data,
          participants: {
            createMany: {
              data: participants,
            },
          },
          authorizationData: data.authorizationData as JsonObject,
        },
        include: {
          participants: true,
          messages: true,
        },
      }),
    );
  }
  public async createChatMessage(
    data: ChatModel.DTO.DB.CreateMessage,
  ): Promise<ChatModel.Models.IChatMessage> {
    return this.formatChatMessage(
      await this.prisma.chatMessage.create({
        data,
      }),
    );
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
