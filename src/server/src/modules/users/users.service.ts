import { Injectable } from '@nestjs/common';
import { DbService } from '../db';
import { HTTPContext } from '@typings/http';
import { User } from '@/helpers/User';
import { UpdateUser } from './users.controller';

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {}

  async updateUser(
    ctx: HTTPContext<true>,
    newUser: UpdateUser,
  ): Promise<boolean> {
    const { id } = ctx.user;
    try {
      const resp = await this.db.users.update(id, newUser);
      new User(ctx.session).merge(resp);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
