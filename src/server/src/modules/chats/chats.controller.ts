import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Auth } from '../auth/decorators';
import ChatsModel from '@typings/models/chat';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import ChatCtx from './decorators/Chat.pipe';
import Chat from './chat';
import { InternalEndpointResponse } from '@typings/api';
import { ChatAuth, ChatOPAuth } from './decorators/Role.guard';
import UserCtx from '../users/decorators/User.pipe';
import User from '../users/user';

const Targets = ChatsModel.Endpoints.Targets;

@Auth()
@Controller()
export class ChatsController {
  constructor(private readonly service: ChatsService) {}

  @Get(Targets.GetSessionChats)
  async get(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.GetChats>> {
    const chats = await this.service.getAllByUserId(user.id);

    return chats.map((chat) => chat.id);
  }

  @Get(Targets.GetChat)
  async getOne(
    @ChatCtx() chat: Chat,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.GetChat>> {
    return chat.display;
  }

  @Get(Targets.GetChatMessages)
  async getMessages(
    @ChatCtx() chat: Chat,
    @Query('cursor', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    cursor: number,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.GetChatMessages>> {
    const messages = await chat.getMessages(cursor);

    return messages;
  }

  @Get(Targets.GetChatParticipants)
  async getParticipants(
    @ChatCtx() chat: Chat,
  ): Promise<
    InternalEndpointResponse<ChatsModel.Endpoints.GetChatParticipants>
  > {
    return chat.participants.map((p) => p.public);
  }

  @Get(Targets.GetChatMessage)
  async getMessage(
    @ChatCtx() chat: Chat,
    @Param('messageId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    messageId: number,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.GetChatMessage>> {
    const message = await chat.getMessage(messageId);
    if (!message) throw new NotFoundException();
    return message;
  }

  @Get(Targets.GetUserChats)
  async getUserChats(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    userId: number,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.GetUserChats>> {
    const chats = await this.service.getAllByUserId(userId);
    return chats.map((chat) => chat.public);
  }

  @Get(Targets.GetPublicChats)
  async getPublicChats(): Promise<
    InternalEndpointResponse<ChatsModel.Endpoints.GetPublicChats>
  > {
    return await this.service.publics;
  }

  @Put(Targets.CreateChat)
  async create(
    @HttpCtx() { user }: HTTPContext<true>,
    @Body() data: ChatsModel.DTO.NewChat,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.CreateChat>> {
    const chat = await this.service.create(data, user);
    return chat.id;
  }

  @Put(Targets.CreateMessage)
  @ChatAuth()
  async createMessage(
    @ChatCtx() chat: Chat,
    @Body() data: ChatsModel.DTO.NewMessage,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.CreateMessage>> {
    return await chat.addMessage(user, data);
  }

  // @Patch(Targets.UpdateChatInfo)
  // @ChatOPAuth()
  // async updateChatInfo(
  //   @ChatCtx() chat: Chat,
  //   @Body() data: ChatsModel.DTO.DB.UpdateChatInfo,
  // ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.UpdateChatInfo>> {
  //   const [ok, resp] = await chat.updateInfo(data);
  //   if (!ok) return buildErrorResponse(resp);
  //   return (resp);
  // }

  @Patch(Targets.UpdateParticipant)
  @ChatAuth()
  async updateParticipant(
    @ChatCtx() chat: Chat,
    @Param('participantId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    participantId: number,
    @Body() data: ChatsModel.DTO.DB.UpdateParticipant,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.UpdateParticipant>> {
    await chat.updateParticipant(user, participantId, data);
  }

  @Post(Targets.CheckOrCreateDirectChat)
  async checkOrCreateDirectChat(
    @HttpCtx() { user }: HTTPContext<true>,
    @UserCtx('targetId') target: User,
  ): Promise<
    InternalEndpointResponse<ChatsModel.Endpoints.CheckOrCreateDirectChat>
  > {
    const [exists, chat] = await this.service.checkOrCreateDirectChat(
      user,
      target,
    );
    if (!chat)
      throw new InternalServerErrorException(
        'Failed to create or check a direct chat',
      );
    return {
      exists,
      chatId: chat.id,
    };
  }

  @Post(Targets.LeaveChat)
  @ChatAuth()
  async leaveChat(
    @ChatCtx() chat: Chat,
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.LeaveChat>> {
    const participant = chat.getParticipantByUserId(user.id);
    if (!participant)
      throw new InternalServerErrorException(
        'Participant validated but not found',
      );
    await chat.removeParticipant(participant.id);
  }
  @Delete(Targets.DeleteParticipant)
  @ChatOPAuth()
  async deleteParticipant(
    @ChatCtx() chat: Chat,
    @Param('participantId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    participantId: number,
    @HttpCtx() { user: op }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.DeleteParticipant>> {
    await chat.removeParticipant(op, participantId);
  }

  @Post(Targets.BanParticipant)
  @ChatOPAuth()
  async banParticipant(
    @ChatCtx() chat: Chat,
    @Param('participantId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    participantId: number,
    @HttpCtx() { user: op }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.BanParticipant>> {
    await chat.setParticipantBanState(op, participantId, true);
  }

  @Delete(Targets.BanParticipant)
  @ChatOPAuth()
  async unbanParticipant(
    @ChatCtx() chat: Chat,
    @Param('participantId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    participantId: number,
    @HttpCtx() { user: op }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.UnbanParticipant>> {
    await chat.setParticipantBanState(op, participantId, false);
  }

  @Post(Targets.TransferOwnership)
  @ChatAuth(ChatsModel.Models.ChatParticipantRole.Owner)
  async transferOwnership(
    @ChatCtx() chat: Chat,
    @Body('targetParticipantId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    participantId: number,
    @HttpCtx()
    { user: op }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.TransferOwnership>> {
    await chat.transferOwnership(op, participantId);
  }

  @Post(Targets.MuteParticipant)
  @ChatOPAuth()
  async muteParticipant(
    @ChatCtx() chat: Chat,
    @Param('participantId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    participantId: number,
    @HttpCtx() { user: op }: HTTPContext<true>,
    @Body('until') until?: number,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.MuteParticipant>> {
    await chat.muteParticipant(op, participantId, until);
  }

  @Delete(Targets.DeleteChat)
  @ChatAuth(ChatsModel.Models.ChatParticipantRole.Owner)
  async delete(
    @ChatCtx() chat: Chat,
    @HttpCtx() { user: op }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.DeleteChat>> {
    await this.service.nukeChat(chat.id, op);
  }
}
// @Patch(Targets.UpdateMessage)
// @ChatAuth()
// async updateMessage(
//   @ChatCtx() chat: Chat,
//   @Param('messageId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
//   messageId: number,
//   @Body() data: ChatsModel.DTO.DB.UpdateMessage,
// ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.UpdateMessage>> {
//   const [ok, resp] = await chat.updateMessage(messageId, data);
//   if (!ok) return buildErrorResponse(resp);
//   return (resp);
// }

// @Delete(Targets.DeleteChat)
// @ChatAuth(ChatsModel.Models.ChatParticipantRole.Owner)
// async delete(
//   @ChatCtx() chat: Chat,
// ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.DeleteChat>> {
//   const ok = await chat.delete();
//   if (!ok) return buildErrorResponse('Failed to delete chat');
//   return buildEmptyResponse();
// }

// @Delete(Targets.DeleteMessage)
// @ChatAuth()
// async deleteMessage(
//   @ChatCtx() chat: Chat,
//   @Param('messageId', new ParseIntPipe({ errorHttpStatusCode: 400 }))
//   messageId: number,
// ): Promise<InternalEndpointResponse<ChatsModel.Endpoints.DeleteMessage>> {
//   const [ok, resp] = await chat.deleteMessage(messageId);
//   if (!ok) return buildErrorResponse(resp);
//   return (resp);
// }
