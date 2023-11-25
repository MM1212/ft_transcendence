import { CacheObserver } from '@shared/CacheObserver';
import ChatsModel from '@typings/models/chat';
import { ChatDependencies } from './dependencies';
import { GroupEnumValues } from '@typings/utils';
import User from '@/modules/users/user';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HttpError } from '@/helpers/decorators/httpError';
import { isDeepStrictEqual } from 'util';

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
  public isRawMember(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Member;
  }
  public isOwner(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Owner;
  }
  public isAdmin(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Admin;
  }
  public isOP(): boolean {
    return this.isOwner() || this.isAdmin();
  }
  public isBanned(): boolean {
    return this.role === ChatsModel.Models.ChatParticipantRole.Banned;
  }
  public isMuted(): boolean {
    const muted = this.get('muted');
    if (muted === ChatsModel.Models.ChatParticipantMuteType.No) return false;
    return true;
  }
  public wasMuted(): boolean {
    const muted = this.get('muted');
    if (muted === ChatsModel.Models.ChatParticipantMuteType.No) return false;
    if (muted === ChatsModel.Models.ChatParticipantMuteType.Forever)
      return false;
    return Date.now() >= this.get('mutedUntil')!;
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
  private getNextOwner(): Participant | null {
    const admins = this.participants.filter((p) => p.isAdmin());
    if (admins.length) return admins[0];
    const members = this.participants.filter((p) => p.isRawMember());
    if (members.length) return members[0];
    return null;
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
    const pUser = await participant.user;
    if (!pUser) throw new NotFoundException();
    if (op instanceof User) {
      const participantOp = this.getParticipantByUserId(op.id);
      if (!participantOp) throw new ForbiddenException();
      if (!participantOp.isOP())
        throw new ForbiddenException('Insufficient permissions');
      if (participant.isAdmin() && !participantOp.isOwner())
        throw new ForbiddenException('Insufficient permissions');
    }
    if (participant.isOwner()) {
      const nextOwner = this.getNextOwner();
      if (nextOwner) {
        await this.transferOwnership(pUser, nextOwner.id);
      }
    }
    const ok = !!(await this.helpers.db.chats.updateChatParticipant(
      participantId,
      {
        role: ChatsModel.Models.ChatParticipantRole.Left,
      },
    ));
    if (!ok) return false;
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      {
        type: 'remove',
        participantId,
        chatId: this.id,
        banned: false,
      },
    );
    participant.set('role', ChatsModel.Models.ChatParticipantRole.Left);
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
    if (!participant || !participant.isMember()) throw new ForbiddenException();
    if (participant.wasMuted())
      await this.updateParticipant(author, participant.id, {
        muted: ChatsModel.Models.ChatParticipantMuteType.No,
        mutedUntil: null,
      });
    else if (participant.isMuted())
      throw new ForbiddenException('You are muted');
    // handle direct message block
    if (this.isDirect) {
      const targetParticipant = this.participants.find(
        (p) => p.id !== participant.id,
      );
      if (!targetParticipant) throw new NotFoundException();
      const target = await targetParticipant.user;
      if (!target) throw new NotFoundException();
      if (author.friends.isBlocked(targetParticipant.userId))
        throw new ForbiddenException(`You blocked ${target.nickname}`);
      if (target.friends.isBlocked(author.id))
        throw new ForbiddenException(`You were blocked by ${target.nickname}`);
    }
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
    const participantOp = this.getParticipantByUserId(op.id);
    if (!participantOp) throw new ForbiddenException();
    if (!participantOp.isOP() && participant.userId !== op.id)
      throw new ForbiddenException();
    const participantData = (Object.keys(data) as (keyof typeof data)[]).reduce(
      (prev, key) => ({ ...prev, [key]: participant.get(key) }),
      {},
    );
    if (isDeepStrictEqual(participantData, data)) return participant;
    const result = await this.helpers.db.chats.updateChatParticipant(
      participantId,
      data,
    );
    participant.setTo(result);
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      {
        type: 'update',
        participantId,
        chatId: this.id,
        participant: data,
      },
    );
    return participant;
  }

  public async setParticipantBanState(
    op: User,
    participantId: number,
    banned: boolean,
  ): Promise<void> {
    const participant = this.getParticipant(participantId, false);
    console.log(participant);
    if (!participant) throw new NotFoundException();
    if (participant.isBanned() === banned) return;
    const participantOp = this.getParticipantByUserId(op.id);
    if (!participantOp) throw new ForbiddenException();
    if (!participantOp.isOP())
      throw new ForbiddenException('Insufficient permissions');
    if (participant.isAdmin() && !participantOp.isOwner())
      throw new ForbiddenException('Insufficient permissions');
    const result = await this.helpers.db.chats.updateChatParticipant(
      participantId,
      {
        role: banned
          ? ChatsModel.Models.ChatParticipantRole.Banned
          : ChatsModel.Models.ChatParticipantRole.Left,
      },
    );
    // TODO: notify target that he was banned
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      banned
        ? {
            type: 'remove',
            banned,
            chatId: this.id,
            participantId,
          }
        : {
            type: 'update',
            participantId,
            chatId: this.id,
            participant: {
              role: ChatsModel.Models.ChatParticipantRole.Left,
            },
          },
    );
    participant.setTo(result);
  }

  public async transferOwnership(
    op: User,
    participantId: number,
  ): Promise<void> {
    const targetParticipant = this.getParticipant(participantId, true);
    if (!targetParticipant) throw new NotFoundException();
    if (targetParticipant.isOwner()) throw new ForbiddenException();
    const participantOp = this.getParticipantByUserId(op.id);
    if (!participantOp) throw new ForbiddenException();
    if (!participantOp.isOwner())
      throw new ForbiddenException('Insufficient permissions');
    await this.helpers.db.chats.updateChatParticipant(participantOp.id, {
      role: ChatsModel.Models.ChatParticipantRole.Member,
    });
    await this.helpers.db.chats.updateChatParticipant(participantId, {
      role: ChatsModel.Models.ChatParticipantRole.Owner,
    });
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      {
        type: 'update',
        participantId,
        chatId: this.id,
        participant: {
          role: ChatsModel.Models.ChatParticipantRole.Owner,
        },
      },
    );
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      {
        type: 'update',
        participantId: participantOp.id,
        chatId: this.id,
        participant: {
          role: ChatsModel.Models.ChatParticipantRole.Member,
        },
      },
    );
    targetParticipant.set('role', ChatsModel.Models.ChatParticipantRole.Owner);
    participantOp.set('role', ChatsModel.Models.ChatParticipantRole.Member);
  }
  public async muteParticipant(
    op: User,
    participantId: number,
    until?: number,
  ): Promise<void> {
    const participant = this.getParticipant(participantId, true);
    if (!participant) throw new NotFoundException();
    const participantOp = this.getParticipantByUserId(op.id);
    if (!participantOp) throw new ForbiddenException();
    if (!participantOp.isOP())
      throw new ForbiddenException('Insufficient permissions');
    if (participant.isAdmin() && !participantOp.isOwner())
      throw new ForbiddenException('Insufficient permissions');
    const result = await this.helpers.db.chats.updateChatParticipant(
      participantId,
      {
        muted: until
          ? ChatsModel.Models.ChatParticipantMuteType.Until
          : ChatsModel.Models.ChatParticipantMuteType.Forever,
        mutedUntil: until ? Date.now() + until : undefined,
      },
    );
    participant.setTo(result);
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      this.sseTargets,
      {
        type: 'update',
        participantId,
        chatId: this.id,
        participant: {
          muted: participant.get('muted'),
          mutedUntil: participant.get('mutedUntil'),
        },
      },
    );
  }
  public async nuke(op: User): Promise<void> {
    const participant = this.getParticipantByUserId(op.id);
    if (!participant) throw new ForbiddenException();
    if (!participant.isOwner())
      throw new ForbiddenException('Insufficient permissions');
    await this.helpers.db.chats.deleteChat(this.id);
    this.participants.forEach((p) =>
      this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
        ChatsModel.Sse.Events.UpdateParticipant,
        [p.userId],
        {
          type: 'remove',
          participantId: p.id,
          chatId: this.id,
          banned: false,
        },
      ),
    );
  }
}

export default Chat;
