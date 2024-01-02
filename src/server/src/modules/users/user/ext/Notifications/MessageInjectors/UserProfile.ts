import User from '../../..';
import { MessageInjectorBase } from './base';

export default class UserProfileMessageInjector extends MessageInjectorBase {
  constructor(user: User, transform?: (label: string) => string) {
    super('route', {
      path: `/profile/${user.id}`,
      label: transform?.(user.nickname) ?? user.nickname,
    });
  }
}
