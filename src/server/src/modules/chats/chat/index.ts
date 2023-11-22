import { CacheObserver } from '@shared/CacheObserver';
import ChatsModel from '@typings/models/chat';
import { ChatDependencies } from './dependencies';
import { GroupEnumValues } from '@typings/utils';
import User from '@/modules/users/user';
import { ForbiddenException } from '@nestjs/common';
import { HttpError } from '@/helpers/decorators/httpError';

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
  public get isMuted(): boolean {
    const muted = this.get('muted');
    if (muted === ChatsModel.Models.ChatParticipantMuteType.No) return false;
    if (muted === ChatsModel.Models.ChatParticipantMuteType.Forever)
      return true;
    return Date.now() < this.get('mutedUntil')!;
  }
  public get toReadPings(): number {
    return this.get('toReadPings');
  }
  public set toReadPings(value: number) {
    this.set('toReadPings', value);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { messages, authorizationData, ...chat } = this.get();
    return {
      ...chat,
      participants: chat.participants.map((p: Participant) => p.public),
    } satisfies ChatsModel.Models.IChatInfo;
  }
  public get display(): ChatsModel.Models.IChatDisplay {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      throw new HttpError(
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
  public async removeParticipant(participantId: number): Promise<boolean>;
  public async removeParticipant(
    op: User,
    participantId: number,
  ): Promise<boolean>;
  public async removeParticipant(
    op: number | User,
    participantId?: number,
  ): Promise<boolean> {
    if (!participantId) participantId = op as number;
    const participant = this.getParticipant(participantId, true);
    if (!participant) return false;
    if (op instanceof User) {
      const participantOp = this.getParticipantByUserId(op.id);
      if (!participantOp) throw new ForbiddenException();
      if (!participantOp.isAdmin())
        throw new ForbiddenException('Insufficient permissions');
      if (participant.isAdmin() && !participantOp.isOwner())
        throw new ForbiddenException('Insufficient permissions');
    }
    const ok = !!(await this.helpers.db.chats.updateChatParticipant(
      participantId,
      {
        role: ChatsModel.Models.ChatParticipantRole.Left,
      },
    ));
    if (!ok) return false;
    participant.set('role', ChatsModel.Models.ChatParticipantRole.Left);
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      {
        type: 'remove',
        participantId,
      },
    );
    return true;
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
    const messages = await this.helpers.db.chats.getChatMessages(
      this.id,
      cursor,
    );
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
    await this.helpers.db.chats.updateChatParticipants(
      this.id,
      {
        toReadPings: {
          increment: 1,
        },
      },
      [participant.id],
    );
    this.participants.forEach((p) => {
      if (p.id === participant.id) return;
      p.toReadPings++;
    });
    console.log(this.get('messages'));

    this.set('messages', (prev) => [result, ...prev]);
    if (this.lastMessages.length > ChatsModel.Models.MAX_MESSAGES_PER_CHAT)
      this.set('messages', (prev) =>
        prev.slice(0, ChatsModel.Models.MAX_MESSAGES_PER_CHAT),
      );
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.NewMessageEvent>(
      ChatsModel.Sse.Events.NewMessage,
      author.id,
      this.sseTargets,
      result,
    );
    return result;
  }

  public async updateParticipant(
    op: User,
    participantId: number,
    data: ChatsModel.DTO.UpdateParticipant,
  ): Promise<Participant> {
    const participant = this.getParticipant(participantId, true);
    if (!participant) throw new ForbiddenException();
    if (!participant.isAdmin() && participant.userId !== op.id)
      throw new ForbiddenException();
    const result = await this.helpers.db.chats.updateChatParticipant(
      participantId,
      data,
    );
    participant.setTo(result);
    return participant;
  }
}

export default Chat;
