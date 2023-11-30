import {
  IPenguinAnimationSetTypes,
  IPenguinBaseAnimationsTypes,
} from '@typings/penguin';
import { vector2 } from '@typings/vector';

export namespace Lobbies {
  export interface IPlayerTransform {
    position: vector2;
    direction: vector2;
    speed: number;
  }
  export interface IPlayer {
    userId: number;
    transform: IPlayerTransform;
    currentAnimation: IPenguinBaseAnimationsTypes;
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
      players: (Partial<IPlayerTransform> & { id: number, newAnim?: IPenguinBaseAnimationsTypes })[];
    }
  }
}
