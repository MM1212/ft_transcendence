import { Injectable } from '@nestjs/common';
import Chat from './chat';
import { ChatDependencies } from './chat/dependencies';
import { DbService } from '../db';
import { UsersService } from '../users/users.service';
import User from '../users/user';
import ChatsModel from '@typings/models/chat';
import { ChatModel } from '@typings/api';

@Injectable()
export class ChatsService {
  private readonly chats: Map<number, Chat> = new Map();
  constructor(private readonly deps: ChatDependencies) {
    // @ts-expect-error - circular dependency
    this.deps.service = this;
  }

  private get db(): DbService {
    return this.deps.db;
  }
  private get users(): UsersService {
    return this.deps.usersService;
  }

  private build(data: ChatsModel.Models.IChat): Chat {
    const chat = new Chat(data, this.deps);
    this.chats.set(chat.id, chat);
    return chat;
  }

  public has(id: number): boolean {
    return this.chats.has(id);
  }

  public getAll(): Chat[] {
    return [...this.chats.values()];
  }
  public get publics(): Promise<ChatsModel.Models.IChatInfo[]> {
    return this.db.chats.getAllPublicChats();
  }

  private async fetch(id: number): Promise<ChatsModel.Models.IChat | null> {
    return this.db.chats.formatChat(await this.db.chats.get(id));
  }

  public async get(id: number, fetch: boolean = false): Promise<Chat | null> {
    if (!this.has(id)) fetch = true;
    const chat = this.chats.get(id);
    if (chat && !fetch) return chat;
    const data = await this.fetch(id);
    if (!data) return null;
    chat?.setTo(data);
    return chat ?? this.build(data);
  }
  public async getAllByUserId(userId: number): Promise<Chat[]> {
    const chats = await this.db.chats.getChatsIdsForUserId(userId);
    return (await Promise.all(chats.map((chatId) => this.get(chatId)))).filter(
      Boolean,
    ) as Chat[];
  }
  public async create(
    data: ChatsModel.DTO.NewChat,
    author?: User,
    propagate: boolean = true,
  ): Promise<Chat> {
    data.participants.forEach(
      (p) =>
        p.role === undefined &&
        (p.role = ChatsModel.Models.ChatParticipantRole.Member),
    );
    if (author && !data.participants.some((p) => p.userId === author.id))
      data.participants.push({
        role: ChatsModel.Models.ChatParticipantRole.Owner,
        userId: author.id,
      });
    const chatData = await this.db.chats.createChat(data);
    const chat = this.build(chatData);
    if (!propagate) return chat;
    if (author)
      this.deps.sseService.emitToTargets<ChatsModel.Sse.NewChatEvent>(
        ChatsModel.Sse.Events.NewChat,
        author.id,
        chat.participants.map((p) => p.userId).filter((id) => id !== author.id),
        { chatId: chat.id },
      );
    else
      this.deps.sseService.emitToTargets<ChatsModel.Sse.NewChatEvent>(
        ChatsModel.Sse.Events.NewChat,
        chat.participants.map((p) => p.userId),
        { chatId: chat.id },
      );
    return chat;
  }

  public async checkOrCreateDirectChat(
    user: User,
    target: User,
  ): Promise<[boolean, Chat | null]> {
    const chatId = await this.db.chats.checkChatWithParticipants(
      ChatModel.Models.ChatType.Direct,
      user.id,
      target.id,
    );
    if (chatId) return [true, await this.get(chatId)];
    return [
      false,
      await this.create({
        authorization: ChatModel.Models.ChatAccess.Private,
        authorizationData: null,
        name: '',
        participants: [
          {
            userId: user.id,
          },
          {
            userId: target.id,
          },
        ] as ChatsModel.DTO.DB.CreateDBParticipant[],
        photo: null,
        topic: '',
        type: ChatModel.Models.ChatType.Direct,
      }),
    ];
  }

  public async nukeChat(id: number, op: User): Promise<void> {
    const chat = await this.get(id);
    if (!chat) return;
    await chat.nuke(op);
    this.chats.delete(id);
  }
}
