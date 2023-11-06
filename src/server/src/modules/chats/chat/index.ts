import { CacheObserver } from '@shared/CacheObserver';
import ChatsModel from '@typings/models/chat';
import { ChatDependencies } from './dependencies';
import { GroupEnumValues } from '@typings/utils';
import User from '@/modules/users/user';
import { ForbiddenException } from '@nestjs/common';

class Participant extends CacheObserver<ChatsModel.Models.IChatParticipant> {
  constructor(
    data: ChatsModel.Models.IChatParticipant,
    public readonly chat: Chat,
  ) {
    super(data);
  }
  public get public(): ChatsModel.Models.IChatParticipant {
    return this.get();
  }
  public get id(): number {
    return this.get('id');
  }
  public get userId(): number {
    return this.get('userId');
  }
  public get user(): Promise<User | null> {
    return this.chat.helpers.usersService.get(this.userId);
  }
  public get role(): ChatsModel.Models.ChatParticipantRole {
    return this.get('role') as ChatsModel.Models.ChatParticipantRole;
  }
  public isMember(): boolean {
    switch (this.role) {
      case ChatsModel.Models.ChatParticipantRole.Admin:
      case ChatsModel.Models.ChatParticipantRole.Member:
      case ChatsModel.Models.ChatParticipantRole.Owner:
        return true;
      default:
        return false;
    }
  }
  public isOwner(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Owner;
  }
  public isAdmin(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Admin;
  }
  public isBanned(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Banned;
  }
  public get toReadPings(): number {
    return this.get('toReadPings');
  }
  public get createdAt(): number {
    return this.get('createdAt');
  }
}

interface IChat extends Omit<ChatsModel.Models.IChat, 'participants'> {
  participants: unknown[];
}

class Chat extends CacheObserver<IChat> {
  constructor(
    data: ChatsModel.Models.IChat,
    public readonly helpers: ChatDependencies,
  ) {
    super({
      ...data,
      participants: [],
    });
    this.set(
      'participants',
      data.participants.map((p) => new Participant(p, this)),
    );
  }
  public get public(): ChatsModel.Models.IChatInfo {
    const { messages, authorizationData, ...chat } = this.get();
    return {
      ...chat,
      participants: chat.participants.map((p: Participant) => p.public),
    } satisfies ChatsModel.Models.IChatInfo;
  }
  public get display(): ChatsModel.Models.IChatDisplay {
    const { messages, authorizationData, participants, ...chat } = this.get();
    return {
      ...chat,
      participants: participants.map((p: Participant) => p.public),
      messages: this.lastMessage ? [this.lastMessage] : [],
    } satisfies ChatsModel.Models.IChatDisplay;
  }
  public get id(): number {
    return this.get('id');
  }
  public get type(): GroupEnumValues<ChatsModel.Models.ChatType> {
    return this.get('type');
  }
  public get isTemporary(): boolean {
    return this.type === ChatsModel.Models.ChatType.Temp;
  }
  public get isDirect(): boolean {
    return this.type === ChatsModel.Models.ChatType.Direct;
  }
  public get isGroup(): boolean {
    return this.type === ChatsModel.Models.ChatType.Group;
  }
  public get name(): string {
    return this.get('name');
  }
  public get photo(): string | null {
    return this.get('photo');
  }
  public get createdAt(): number {
    return this.get('createdAt');
  }
  public get authorization(): GroupEnumValues<ChatsModel.Models.ChatAccess> {
    return this.get('authorization');
  }
  public get isPublic(): boolean {
    return this.authorization === ChatsModel.Models.ChatAccess.Public;
  }
  public get isPrivate(): boolean {
    return this.authorization === ChatsModel.Models.ChatAccess.Private;
  }
  private get sseTargets(): number[] {
    return this.participants.map((p) => p.userId);
  }

  public async refresh(): Promise<void> {
    const data = await this.helpers.db.chats.get(this.id);
    if (!data)
      throw new Error(
        `Chat with id ${this.id} was not found in database while refreshing`,
      );
    const tmp = this.helpers.db.chats.formatChat(data);
    this.setTo((prev) => ({
      ...tmp,
      messages: prev.messages,
      participants: tmp.participants.map((p) => new Participant(p, this)),
    }));
  }

  public async save(
    {
      name: oldName,
      photo: oldPhoto,
    }: Partial<ChatsModel.Models.IChatInfo> = this.public,
    propagate: boolean = false,
  ): Promise<boolean> {
    const { name, photo } = await this.helpers.db.chats.updateChatInfo(
      this.id,
      {
        name: oldName,
        photo: oldPhoto,
      },
    );
    this.setTo((prev) => ({ ...prev, name, photo }));
    return true;
  }

  public get allParticipants(): Participant[] {
    return this.get('participants') as Participant[];
  }
  public get participants(): Participant[] {
    return this.allParticipants.filter((p) => p.isMember());
  }
  public getParticipantByUserId(
    userId: number,
    member: boolean = true,
  ): Participant | null {
    return (
      this.allParticipants.find(
        (p) => p.userId === userId && (!member || p.isMember()),
      ) ?? null
    );
  }
  public getParticipant(
    id: number,
    member: boolean = true,
  ): Participant | null {
    return (
      this.allParticipants.find(
        (p) => p.id === id && (!member || p.isMember()),
      ) ?? null
    );
  }
  public hasParticipantByUserId(
    userId: number,
    member: boolean = true,
  ): boolean {
    return this.getParticipantByUserId(userId, member) !== null;
  }
  public hasParticipant(id: number, member: boolean = true): boolean {
    return this.getParticipant(id, member) !== null;
  }
  public get lastMessages(): ChatsModel.Models.IChatMessage[] {
    return this.get('messages');
  }
  public get lastMessage(): ChatsModel.Models.IChatMessage | null {
    return this.lastMessages.length ? this.lastMessages[0] : null;
  }
  public async getMessages(
    cursor: number,
  ): Promise<ChatsModel.Models.IChatMessage[]> {
    if (cursor === -1) {
      if (this.lastMessages.length < ChatsModel.Models.MAX_MESSAGES_PER_CHAT)
        this.set(
          'messages',
          await this.helpers.db.chats.getChatMessages(this.id),
        );
      return this.lastMessages;
    }
    const messages = await this.helpers.db.chats.getChatMessages(this.id, cursor);
    console.log(messages);
    
    return messages;
  }
  public async getMessage(
    messageId: number,
  ): Promise<ChatsModel.Models.IChatMessage | null> {
    const cached = this.lastMessages.find((m) => m.id === messageId);
    if (cached) return cached;
    return await this.helpers.db.chats.getChatMessage(messageId);
  }

  public async addMessage(
    author: User,
    data: ChatsModel.DTO.NewMessage,
  ): Promise<ChatsModel.Models.IChatMessage> {
    const participant = this.getParticipantByUserId(author.id);
    if (!participant) throw new ForbiddenException();
    console.log(author, data);
    
    const result = await this.helpers.db.chats.createChatMessage({
      ...data,
      authorId: participant.id,
      chatId: this.id,
    });
    console.log(this.get('messages'));
    
    this.set('messages', (prev) => [result, ...prev]);
    if (this.lastMessages.length > ChatsModel.Models.MAX_MESSAGES_PER_CHAT)
      this.set('messages', (prev) => prev.slice(0, ChatsModel.Models.MAX_MESSAGES_PER_CHAT));
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.NewMessageEvent>(
      ChatsModel.Sse.Events.NewMessage,
      author.id,
      this.sseTargets,
      result,
    );
    return result;
  }
}

export default Chat;
