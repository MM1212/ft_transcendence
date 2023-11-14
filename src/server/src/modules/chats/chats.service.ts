import { Injectable } from '@nestjs/common';
import Chat from './chat';
import { ChatDependencies } from './chat/dependencies';
import { DbService } from '../db';
import { UsersService } from '../users/users.service';
import User from '../users/user';
import ChatsModel from '@typings/models/chat';

@Injectable()
export class ChatsService {
  private readonly chats: Map<number, Chat> = new Map();
  constructor(private readonly deps: ChatDependencies) {}

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
    author: User,
  ): Promise<Chat> {
    data.participants.forEach(
      (p) => (p.role = ChatsModel.Models.ChatParticipantRole.Member),
    );
    data.participants.push({
      role: ChatsModel.Models.ChatParticipantRole.Owner,
      userId: author.id,
    });
    const chatData = await this.db.chats.createChat(data);
    const chat = this.build(chatData);
    this.deps.sseService.emitToTargets<ChatsModel.Sse.NewChatEvent>(
      ChatsModel.Sse.Events.NewChat,
      author.id,
      chat.participants.map((p) => p.userId),
      chat.display,
    );
    return chat;
  }
}
