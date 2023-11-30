import { IAuthSessionUser } from './user';

export interface IAuthSession {
  user: IAuthSessionUser;
  tfa_secret?: string;
  tfa_login?: boolean;
  tfa_user_id?: number;
}
