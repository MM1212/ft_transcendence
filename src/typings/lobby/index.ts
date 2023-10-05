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
  enum LobbyAccess {
    Public,
    Private,
  }

  export interface ILobby {
    id: number;
    name: string;
    topic?: string;
    players: IPlayer[];
    maxPlayers: number;
    access: LobbyAccess;
    accessData: Record<string, unknown>;
    createdAt: Date;
    creatorId: number;
  }

  export namespace API {
    export interface ILobbyCreate {
      name: string;
      topic?: string;
      maxPlayers: number;
      access: LobbyAccess;
      accessData: Record<string, unknown>;
    }
    export interface ILobbyUpdate {
      id: number;
      name?: string;
      topic?: string;
      maxPlayers?: number;
      access?: LobbyAccess;
      accessData?: Record<string, unknown>;
    }
    export interface ILobbyJoin {
      id: number;
      accessData?: Record<string, unknown>;
    }
    export interface ILobbyLeave {
      id: number;
    }
    export interface ILobbyKick {
      id: number;
      userId: number;
    }
  }
}
