import UsersModel from "@typings/models/users";

/**
 * @deprecated
 */
export interface IUser extends UsersModel.Models.IUserInfo {}
/**
 * @deprecated
 */
export interface IUserCreate extends Pick<IUser, 'studentId' | 'nickname' | 'avatar'> {}
