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
    connections: unknown[];
  }

  export interface ILobby {
    players: IPlayer[];
  }

  export namespace Packets {
    export enum Events {
      LoadData = 'lobby/loadData',
      NewPlayer = 'lobby/newPlayer',
      SetPlayers = 'lobby/setPlayers',
      RemovePlayer = 'lobby/removePlayer',
      UpdatePlayersTransform = 'lobby/updatePlayerTransform',
    }
    export interface LoadData {
      players: IPlayer[];
    }
    export interface NewPlayer {
      player: IPlayer;
    }
    export interface SetPlayers {
      players: IPlayer[];
    }
    export interface RemovePlayer {
      id: number;
    }
    export interface UpdatePlayersTransform {
      players: (Partial<IPlayerTransform> & { id: number })[];
    }
  }
}
