import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  Param,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import User from '../user';

@Injectable()
class ParseUserPipe implements PipeTransform {
  constructor(private readonly service: UsersService) {}
  async transform(value: number, metadata: ArgumentMetadata): Promise<User> {
    if (metadata.type !== 'param') throw new Error('Invalid metadata type');
    const user = await this.service.get(value);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

const UserCtx = () =>
  Param(
    'id',
    new ParseIntPipe({ errorHttpStatusCode: 400 }),
    ParseUserPipe,
  );

export default UserCtx;
