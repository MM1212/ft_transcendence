import User from '..';
import { UserDependencies } from '../dependencies';

abstract class UserExtBase {
  constructor(public readonly user: User) {}

  protected get helpers(): UserDependencies {
    // @ts-expect-error - this is a hack to make it work
    return this.user.helpers;
  }
}

export default UserExtBase;
