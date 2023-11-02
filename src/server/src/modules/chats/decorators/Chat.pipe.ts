import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  Param,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';
import Chat from '../chat';
import { ChatsService } from '../chats.service';

@Injectable()
class ParseChatPipe implements PipeTransform {
  constructor(private readonly service: ChatsService) {}
  async transform(value: number, metadata: ArgumentMetadata): Promise<Chat> {
    if (metadata.type !== 'param') throw new Error('Invalid metadata type');
    const chat = await this.service.get(value);
    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }
}

const ChatCtx = () =>
  Param(
    'chatId',
    new ParseIntPipe({ errorHttpStatusCode: 400 }),
    ParseChatPipe,
  );

export default ChatCtx;
