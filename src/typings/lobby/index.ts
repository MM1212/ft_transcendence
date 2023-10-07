import { IUser } from '@typings/user';
import { vector2 } from '@typings/vector';

export namespace Lobbies {
  export interface IPlayerTransform {
    position: vector2;
    velocity: vector2;
  }
  export interface IPlayer {
    user: IUser;
    transform: IPlayerTransform;
    connections: number[];
  }

  export interface ILobby {
    id: number;
    name: string;
    players: IPlayer[];
  }
}
