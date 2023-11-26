import { CacheObserver } from '@shared/CacheObserver';
import ChatsModel from '@typings/models/chat';
import { ChatDependencies } from './dependencies';
import { GroupEnumValues } from '@typings/utils';
import User from '@/modules/users/user';
import {
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import { ChatsService } from '../chats.service';

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
  public isOperator(): boolean {
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

  public get typing(): boolean {
    return this.get('typing');
  }
  private typingTick: NodeJS.Timeout | null = null;
  public set typing(value: boolean) {
    if (this.typingTick) clearTimeout(this.typingTick);
    this.set('typing', value);
    if (value) {
      this.typingTick = setTimeout(() => {
        this.set('typing', false);
        this.typingTick = null;
        this.chat.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
          ChatsModel.Sse.Events.UpdateParticipant,
          this.userId,
          this.chat.sseTargets,
          {
            type: 'update',
            participantId: this.id,
            chatId: this.chat.id,
            participant: {
              typing: false,
            },
          },
        );
      }, 6000);
    }
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
  public get service(): ChatsService {
    return this.helpers.service;
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
  public get sseTargets(): number[] {
    return this.participants.map((p) => p.userId);
  }

  public async save(
    {
      name: oldName,
      photo: oldPhoto,
      topic: oldTopic,
    }: Partial<ChatsModel.Models.IChatInfo> = this.public,
  ): Promise<boolean> {
    const { name, photo, topic } = !this.isTemporary
      ? (await this.helpers.db.chats.updateChatInfo(this.id, {
          name: oldName,
          photo: oldPhoto,
          topic: oldTopic,
        }))!
      : {
          name: oldName ?? this.get('name'),
          photo: oldPhoto ?? this.get('photo'),
          topic: oldTopic ?? this.get('topic'),
        };
    this.setTo((prev) => ({ ...prev, name, photo, topic }));
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
      if (!participantOp.isOperator())
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
    const ok = this.isTemporary
      ? true
      : !!(await this.helpers.db.chats.updateChatParticipant(participantId, {
          role: ChatsModel.Models.ChatParticipantRole.Left,
        }));
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
    if (this.isTemporary) return this.lastMessages;
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
    if (this.isTemporary) return null;
    return await this.helpers.db.chats.getChatMessage(messageId);
  }

  public async addMessage(
    author: User,
    data: ChatsModel.DTO.NewMessage,
    sendToAuthor: boolean = false,
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
    const result: ChatsModel.Models.IChatMessage = !this.isTemporary
      ? await this.helpers.db.chats.createChatMessage({
          ...data,
          authorId: participant.id,
          chatId: this.id,
        })
      : ({
          id: this.lastMessages.length + 1,
          authorId: participant.id,
          chatId: this.id,
          createdAt: Date.now(),
          message: data.message,
          type: data.type,
          meta: data.meta,
        } satisfies ChatsModel.Models.IChatMessage);
    !this.isTemporary &&
      (await this.helpers.db.chats.updateChatParticipants(
        this.id,
        {
          toReadPings: {
            increment: 1,
          },
        },
        [participant.id],
      ));
    this.participants.forEach((p) => {
      if (p.id === participant.id) return;
      p.toReadPings++;
    });
    this.set('messages', (prev) => [result, ...prev]);
    if (this.lastMessages.length > ChatsModel.Models.MAX_MESSAGES_PER_CHAT)
      this.set('messages', (prev) =>
        prev.slice(0, ChatsModel.Models.MAX_MESSAGES_PER_CHAT),
      );
    if (sendToAuthor)
      this.helpers.sseService.emitToTargets<ChatsModel.Sse.NewMessageEvent>(
        ChatsModel.Sse.Events.NewMessage,
        this.sseTargets,
        result,
      );
    else
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
    data: Partial<ChatsModel.DTO.UpdateParticipant>,
  ): Promise<Participant> {
    const participant = this.getParticipant(participantId, true);
    if (!participant) throw new ForbiddenException();
    const participantOp = this.getParticipantByUserId(op.id);
    if (!participantOp) throw new ForbiddenException();
    if (!participantOp.isOperator() && participant.userId !== op.id)
      throw new ForbiddenException();
    const participantData = (Object.keys(data) as (keyof typeof data)[]).reduce(
      (prev, key) => ({ ...prev, [key]: participant.get(key) }),
      {},
    );
    if (isDeepStrictEqual(participantData, data)) return participant;
    const result = !this.isTemporary
      ? await this.helpers.db.chats.updateChatParticipant(participantId, data)
      : ({
          ...participant.get(),
          ...data,
        } satisfies ChatsModel.Models.IChatParticipant);
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
    if (!participant) throw new NotFoundException();
    if (participant.isBanned() === banned) return;
    const participantOp = this.getParticipantByUserId(op.id);
    if (!participantOp) throw new ForbiddenException();
    if (!participantOp.isOperator())
      throw new ForbiddenException('Insufficient permissions');
    if (participant.isAdmin() && !participantOp.isOwner())
      throw new ForbiddenException('Insufficient permissions');
    const result = !this.isTemporary
      ? await this.helpers.db.chats.updateChatParticipant(participantId, {
          role: banned
            ? ChatsModel.Models.ChatParticipantRole.Banned
            : ChatsModel.Models.ChatParticipantRole.Left,
        })
      : ({
          ...participant.get(),
          role: banned
            ? ChatsModel.Models.ChatParticipantRole.Banned
            : ChatsModel.Models.ChatParticipantRole.Left,
        } satisfies ChatsModel.Models.IChatParticipant);
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
    !this.isTemporary &&
      (await this.helpers.db.chats.transferChatOwnership(
        this.id,
        participantOp.id,
        participantId,
      ));
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
    if (!participantOp.isOperator())
      throw new ForbiddenException('Insufficient permissions');
    if (participant.isAdmin() && !participantOp.isOwner())
      throw new ForbiddenException('Insufficient permissions');
    const result = !this.isTemporary
      ? await this.helpers.db.chats.updateChatParticipant(participantId, {
          muted: until
            ? ChatsModel.Models.ChatParticipantMuteType.Until
            : ChatsModel.Models.ChatParticipantMuteType.Forever,
          mutedUntil: until ? Date.now() + until : null,
        })
      : ({
          ...participant.get(),
          muted: until
            ? ChatsModel.Models.ChatParticipantMuteType.Until
            : ChatsModel.Models.ChatParticipantMuteType.Forever,
          mutedUntil: until ? Date.now() + until : null,
        } satisfies ChatsModel.Models.IChatParticipant);
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
    !this.isTemporary && (await this.helpers.db.chats.deleteChat(this.id));
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

  public async sendInviteToTargets(
    op: User,
    _targets: ChatsModel.DTO.SendInviteToTarget[],
  ): Promise<void> {
    if (!this.isGroup) throw new ForbiddenException();
    const participant = this.getParticipantByUserId(op.id);
    if (!participant) throw new ForbiddenException();
    if (!this.isPublic && !participant.isOperator())
      throw new ForbiddenException('Insufficient permissions');
    const targets: (User | Chat | null)[] = await Promise.all(
      _targets.map(async (t) => {
        switch (t.type) {
          case 'chat':
            return await this.service.get(t.id);
          case 'user':
            return await this.helpers.usersService.get(t.id);
          default:
            return null;
        }
      }),
    );
    if (targets.includes(null)) throw new ForbiddenException('Invalid targets');
    try {
      const chats = await Promise.all(
        targets.map(async (t) => {
          if (t instanceof Chat) return t;
          const user = t as User;
          const [, chat] = await this.service.checkOrCreateDirectChat(op, user);
          return chat as Chat;
        }),
      );
      await Promise.all(
        chats.map((chat) => {
          return chat.addMessage(
            op,
            {
              message: `Invite to ${this.name}`,
              type: ChatsModel.Models.ChatMessageType.Embed,
              meta: {
                type: ChatsModel.Models.Embeds.Type.ChatInvite,
                chatId: this.id,
              },
            },
            true,
          );
        }),
      );
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Failed to send invites');
    }
  }
  public async setTyping(user: User, state: boolean): Promise<void> {
    const participant = this.getParticipantByUserId(user.id);
    if (!participant) throw new ForbiddenException();
    if (!participant.isMember()) throw new ForbiddenException();
    participant.typing = state;
    this.helpers.sseService.emitToTargets<ChatsModel.Sse.UpdateParticipantEvent>(
      ChatsModel.Sse.Events.UpdateParticipant,
      user.id,
      this.sseTargets,
      {
        type: 'update',
        participantId: participant.id,
        chatId: this.id,
        participant: {
          typing: state,
        },
      },
    );
  }
}

export default Chat;
