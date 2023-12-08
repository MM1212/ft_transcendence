import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Chat from './chat';
import { ChatDependencies } from './chat/dependencies';
import { DbService } from '../db';
import { UsersService } from '../users/users.service';
import User from '../users/user';
import ChatsModel from '@typings/models/chat';
import { ChatModel, EndpointData } from '@typings/api';
import { hash } from '@shared/index';

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
  public getPublicChats(): Promise<ChatsModel.Models.IChatInfo[]> {
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
    if (data.authorization === ChatsModel.Models.ChatAccess.Protected) {
      if (!data.authorizationData?.password)
        throw new BadRequestException(
          'Password is required for protected chat',
        );
      data.authorizationData.password = hash(
        data.authorizationData.password,
      ).toString();
    }
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

  public async nukeChat(id: number, op?: User): Promise<void> {
    const chat = await this.get(id);
    if (!chat) return;
    await chat.nuke(op);
    this.chats.delete(id);
  }

  private async rejoinChat(chat: Chat, op: User): Promise<void> {
    const participant = chat.getParticipantByUserId(op.id, false);
    if (!participant)
      throw new BadRequestException('You are not in this chat.');
    if (participant.role === ChatsModel.Models.ChatParticipantRole.Banned)
      throw new ForbiddenException('You are banned from this chat.');
    if (participant.role !== ChatsModel.Models.ChatParticipantRole.Left)
      throw new InternalServerErrorException('Invalid participant role.');
    await chat.updateParticipant(
      op,
      participant.id,
      {
        role: ChatsModel.Models.ChatParticipantRole.Member,
        toReadPings: 0,
      },
      false,
    );
  }
  public async joinChat(
    id: number,
    op: User,
    { password, messageData }: EndpointData<ChatsModel.Endpoints.JoinChat> = {},
  ): Promise<void> {
    const chat = await this.get(id);
    if (!chat) throw new BadRequestException('Chat does not exist.');
    switch (chat.authorization) {
      case ChatsModel.Models.ChatAccess.Private: {
        if (!messageData)
          throw new BadRequestException('Message data is required.');
        if (!messageData.id || !messageData.nonce)
          throw new BadRequestException('Message data is invalid.');
        const message = await chat.getMessage(messageData.id);
        if (!message)
          throw new BadRequestException('Message does not exist in this chat.');
        if (message.type !== ChatModel.Models.ChatMessageType.Embed)
          throw new BadRequestException('Message is not an embed.');
        const { inviteNonce } =
          message.meta as ChatsModel.Models.Embeds.ChatInvite;
        if (!inviteNonce || inviteNonce !== messageData.nonce)
          throw new BadRequestException('Message is not a valid invite.');
        break;
      }
      case ChatsModel.Models.ChatAccess.Protected: {
        if (!password) throw new BadRequestException('Password is required.');
        if (
          chat.get('authorizationData.password') !== hash(password).toString()
        )
          throw new BadRequestException('Password is incorrect.');
        break;
      }
    }
    if (chat.hasParticipantByUserId(op.id, true))
      throw new BadRequestException('You are already in this chat.');
    else if (chat.hasParticipantByUserId(op.id, false))
      return await this.rejoinChat(chat, op);
    if (chat.isDirect)
      throw new ForbiddenException('You cannot join a direct chat.');
    await chat.addParticipant(op);
  }

  async leaveChat(id: number, user: User): Promise<void> {
    const chat = await this.get(id);
    if (!chat) throw new BadRequestException('Chat does not exist.');
    const participant = chat.getParticipantByUserId(user.id);
    if (!participant)
      throw new InternalServerErrorException(
        'Participant validated but not found',
      );
    await chat.removeParticipant(participant.id);
    if (chat.participants.length === 0) await this.nukeChat(chat.id);
  }
}
