import User from '..';
import { UserDependencies } from '../dependencies';

abstract class UserExtBase {
  constructor(protected readonly user: User) {}

  protected get helpers(): UserDependencies {
    return this.user.helpers;
  }
}

export default UserExtBase;