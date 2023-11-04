<<<<<<< HEAD
export interface IUser {
  id: number;
  studentId: number;
  nickname: string;
  avatar: string;
  createdAt: number | Date;
  online?: boolean;
  experience?: string;
}

export interface IUserCreate
  extends Pick<IUser, "studentId" | "nickname" | "avatar"> {}
=======
import UsersModel from "@typings/models/users";

/**
 * @deprecated
 */
export interface IUser extends UsersModel.Models.IUserInfo {}
/**
 * @deprecated
 */
export interface IUserCreate extends Pick<IUser, 'studentId' | 'nickname' | 'avatar'> {}
>>>>>>> origin/dev
