export interface IUser {
  id: number;
  studentId: number;
  nickname: string;
  avatar: string;
  createdAt: number | Date;
}

export interface IUserCreate extends Pick<IUser, 'studentId' | 'nickname' | 'avatar'> {}
