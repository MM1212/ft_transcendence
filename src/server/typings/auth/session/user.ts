import { IUser } from '@typings/user';
import { Auth } from '..';

export interface IAuthSessionLoggedUser extends IUser {
  token: Auth.Token;
  loggedIn: true;
}

export type IAuthSessionUser = IAuthSessionLoggedUser | { loggedIn: false };
export type IAuthSessionUserData = IAuthSessionLoggedUser & {
  loggedIn: boolean;
};
