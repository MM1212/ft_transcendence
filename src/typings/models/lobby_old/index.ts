import { EndpointRegistry, GroupEndpointTargets } from '@typings/api';
import UsersModel from '@typings/models/users';
import { vector2 } from '@typings/vector';

namespace DEPRECATED_LobbyModel {
  export namespace Models {
    export const STAGE_WIDTH = 2624;
    export const STAGE_HEIGHT = 1476;
    export const STAGE_ASPECT_RATIO = STAGE_WIDTH / STAGE_HEIGHT;
    export interface IPlayerTransform {
      position: vector2;
      velocity: vector2;
    }
    export interface IPlayer {
      user: UsersModel.Models.IUserInfo;
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
      StaticBackground = '/assets/lobby.webp',
      WalkableMask = '/assets/lobby-mask.webp',
    }
    export type All = GroupEndpointTargets<Targets>;
    export interface Registry extends EndpointRegistry {}
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

export default DEPRECATED_LobbyModel;