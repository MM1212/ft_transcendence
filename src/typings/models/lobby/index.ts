import { GroupEndpoints } from '@typings/api';
import { IUser } from '@typings/user';
import { vector2 } from '@typings/vector';

namespace LobbyModel {
  export namespace Models {
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
  }

  export namespace DTO {
    export interface LoadData {
      players: Models.IPlayer[];
    }
    export interface NewPlayer {
      player: Models.IPlayer;
    }
    export interface SetPlayers {
      players: Models.IPlayer[];
    }
    export interface RemovePlayer {
      id: number;
    }
    export interface UpdatePlayersTransform {
      players: (Partial<Models.IPlayerTransform> & { id: number })[];
    }
  }
  export namespace Endpoints {
    export enum Targets {
      Connect = '/lobby',
      StaticBackground = '/static/lobby.png'
    }
    export type All = GroupEndpoints<Targets>;
  }
  export namespace Socket {
    export enum Messages {
      LoadData = 'lobby/loadData',
      NewPlayer = 'lobby/newPlayer',
      SetPlayers = 'lobby/setPlayers',
      RemovePlayer = 'lobby/removePlayer',
      UpdatePlayersTransform = 'lobby/updatePlayerTransform',
    }
  }
}

export default LobbyModel;