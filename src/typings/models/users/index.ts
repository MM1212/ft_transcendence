namespace UsersModel {
  export namespace Models {
    export interface IUser {
      id: number;
      studentId: number;
      nickname: string;
      avatar: string;
      createdAt: number;
      friends: number[];
      chats: number[];
    }
    export interface IUserInfo extends Omit<IUser, 'friends' | 'chats'> {}
  }
  export namespace DTO {
    export namespace DB {
      export interface IUser extends Omit<Models.IUserInfo, 'createdAt'> {
        createdAt: Date;
        friends: { id: number }[];
        friendOf: { id: number }[];
        chats: { id: number }[];
      }
      export interface IUserInfo extends Omit<Models.IUserInfo, 'createdAt'> {
        createdAt: Date;
      }
      export interface IUserCreate
        extends Pick<Models.IUserInfo, 'studentId' | 'nickname' | 'avatar'> {}
    }
  }
  export namespace Endpoints {
    export enum Targets {}
  }
  export namespace Sse {}
}

export default UsersModel;
