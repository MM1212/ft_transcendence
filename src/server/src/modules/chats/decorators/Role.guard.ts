import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ParseIntPipe,
  applyDecorators,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@typings/http';
import { ChatsService } from '../chats.service';
import { Reflector } from '@nestjs/core';
import ChatsModel from '@typings/models/chat';

export const ChatRoles =
  Reflector.createDecorator<ChatsModel.Models.ChatParticipantRole[]>();

export const ChatOPRoles = applyDecorators(
  ChatRoles([
    ChatsModel.Models.ChatParticipantRole.Admin,
    ChatsModel.Models.ChatParticipantRole.Owner,
  ]),
);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly chatsService: ChatsService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userData = request.session.get('user');

    if (!userData?.loggedIn) throw new UnauthorizedException();
    const chatId = await new ParseIntPipe().transform(
      (request.params as Record<string, string>).chatId,
      { type: 'param', metatype: Number },
    );
    try {
      const chat = await this.chatsService.get(chatId);
      if (!chat) throw new UnauthorizedException();
      const cParticipant = chat.getParticipantByUserId(userData.id, true);
      if (!cParticipant) throw new UnauthorizedException();
      const roles = this.reflector.get(ChatRoles, context.getHandler());

      if (!roles || !roles.length) return true;
      if (!roles.includes(cParticipant.role)) throw new ForbiddenException();
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

export const ChatAuth = (...roles: ChatsModel.Models.ChatParticipantRole[]) =>
  applyDecorators(ChatRoles(roles), UseGuards(RolesGuard));

export const ChatOPAuth = () => ChatAuth(
  ChatsModel.Models.ChatParticipantRole.Admin,
  ChatsModel.Models.ChatParticipantRole.Owner,
);
