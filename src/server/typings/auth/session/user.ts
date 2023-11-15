import { Auth } from '..';
import UsersModel from '@typings/models/users';

export interface IAuthSessionLoggedUser extends UsersModel.Models.IUserInfo {
  token: Auth.Token;
  loggedIn: true;
  dummy: boolean;
}

export type IAuthSessionUser = IAuthSessionLoggedUser | { loggedIn: false };
export type IAuthSessionUserData = Omit<IAuthSessionLoggedUser, 'loggedIn'> & {
  loggedIn: boolean;
};
