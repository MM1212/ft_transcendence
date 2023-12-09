import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  Endpoints,
  GetEndpoint,
  GroupEndpointTargets,
  SseModel,
} from '@typings/api';
import { GroupEnumValues } from '@typings/utils';

namespace PongModel {
  export namespace Models {
    export enum LobbyType {
      Single = 'SINGLE', // Single Queue Mode
      Double = 'DOUBLE', // Double Queue Mode
      Custom = 'CUSTOM', // Custom mode
    }
    export enum LobbyGameType {
      Classic = 'CLASSIC', // Classic pong
      Powers = 'POWERS', // Pong with super powers
    }
    export enum LobbyAccess {
      Public = 'PUBLIC', // Anyone can join
      Protected = 'PROTECTED', // Password protected
    }
    export enum LobbyStatus {
      Waiting = 'WAITING',
      Ready = 'READY',
      Playing = 'PLAYING',
      Finished = 'FINISHED',
    }
    export enum LobbySpectatorVisibility {
      All = 'ALL', // Anyone can spectate
      Friends = 'FRIENDS', // Only friends can spectate
      None = 'NONE', // No one can spectate
    }
    export interface ILobbyAuthorizationData {
      password?: string;
    }
    export enum LobbyParticipantRole {
      Player = 'PLAYER', // Player
      Spectator = 'SPECTATOR', // Spectator
    }
    export enum LobbyParticipantPrivileges {
      None = 'NONE', // No privileges
      Owner = 'OWNER', // Lobby "admin"
    }
    export enum LobbyParticipantSpecialPowerType {
      bubble = 'BUBBLE',
      spark = 'SPARK',
      ice = 'ICE',
      fire = 'FIRE',
      ghost = 'GHOST',
      none = 'NONE',
    }
    export enum TeamSide {
      Left,
      Right,
    }
    export enum TeamPosition {
      Top,
      Bottom,
    }

    export type IGameKeyTypes = 'up' | 'down' | 'boost' | 'shoot';
    export type IGamekeys = Record<IGameKeyTypes, string>;
    export const DEFAULT_GAME_KEYS: IGamekeys = {
      up: 'w',
      down: 's',
      boost: 'a',
      shoot: 'q',
    };

    export interface ITeam {
      players: ILobbyParticipant[];
      score: number;
      id: TeamSide;
    }
    export const TemporaryLobbyParticipant = {
      keys: PongModel.Models.DEFAULT_GAME_KEYS,
      paddleTexture: '/pong/PaddleRed.png',
      specialPower: PongModel.Models.LobbyParticipantSpecialPowerType.bubble,
    };
    export interface ILobbyParticipant {
      id: number;
      avatar: string;
      nickname: string;
      lobbyId: number;
      role: GroupEnumValues<LobbyParticipantRole>;
      privileges: GroupEnumValues<LobbyParticipantPrivileges>;
      teamId: TeamSide | null;
      status: GroupEnumValues<LobbyStatus>;
      keys: IGamekeys;
      paddleTexture: string;
      specialPower: GroupEnumValues<LobbyParticipantSpecialPowerType>;
      teamPosition: number;
    }
    export interface ILobby {
      id: number;
      ownerId: number;
      name: string;
      queueType: GroupEnumValues<LobbyType>;
      gameType: GroupEnumValues<LobbyGameType>;
      spectatorVisibility: GroupEnumValues<LobbySpectatorVisibility>; // this will set all users's spectator visibility to this
      status: GroupEnumValues<LobbyStatus>;
      authorization: GroupEnumValues<LobbyAccess>;
      authorizationData: ILobbyAuthorizationData | null;
      nPlayers: number;
      teams: [ITeam, ITeam];
      spectators: ILobbyParticipant[];
      invited: number[];
      chatId: number;
    }

    export interface ILobbyInfoDisplay
      extends Pick<
        ILobby,
        | 'id'
        | 'name'
        | 'gameType'
        | 'spectatorVisibility'
        | 'status'
        | 'authorization'
        | 'nPlayers'
        | 'ownerId'
      > {
      spectators: number;
    }

    export interface ILobbyUpdateParticipantsEvent
      extends Pick<ILobby, 'id' | 'teams' | 'spectators' | 'ownerId'> {
      ownerId: number;
    }

    export interface ILobbyKickParticipantEvent extends ILobby {}

    export interface ILobbyUpdateInvitedEvent extends Pick<ILobby, 'invited'> {}
  }

  export namespace Sse {
    export enum Events {
      NewLobby = 'pong.new-lobby',
      UpdateLobbyParticipants = 'pong.update-lobby-participants',
      UpdateLobbyInvited = 'pong.update-lobby-invited',
      Kick = 'pong.kick-participant',
    }

    export interface UpdateLobbyParticipantEvent
      extends SseModel.Models.Event<
        Models.ILobbyUpdateParticipantsEvent,
        Events.UpdateLobbyParticipants
      > {}

    export interface Kick
      extends SseModel.Models.Event<
        Models.ILobbyKickParticipantEvent,
        Events.Kick
      > {}

    export interface UpdateLobbyInvited
      extends SseModel.Models.Event<
        Models.ILobbyUpdateInvitedEvent,
        Events.UpdateLobbyInvited
      > {}
  }

  export namespace DTO {
    export namespace DB {}
  }

  export namespace Endpoints {
    export enum Targets {
      // PUT
      NewLobby = '/pong/lobby',
      LeaveLobby = '/pong/lobby/leave',
      //POST
      JoinLobby = '/pong/lobby/join',
      ChangeTeam = '/pong/lobby/team',
      ChangeOwner = '/pong/lobby/owner',
      JoinSpectators = '/pong/lobby/spectators',
      Ready = '/pong/lobby/ready',
      Kick = '/pong/lobby/kick',
      Invite = '/pong/lobby/invite',
      //GET
      GetSessionLobby = '/pong/lobby/session',
      GetAllLobbies = '/pong/lobby/all',
      GetLobby = '/pong/lobby/:id',

      // existed before
      Connect = '/pong',
      BallTexture1 = '/pong/Ball.png',
      // BallTexture2 = "",
      MarioBoxTexture = '/pong/MarioBox.png',
      PaddleTexture1 = '/pong/PaddleRed.png',
      // PaddleTexture2 = "",
      PowerWaterTexture = '/pong/PowerWater.png',
      PowerCannonTexture = '/pong/PowerCannon.png',
      PowerIceTexture = '/pong/PowerIce.png',
      PowerSparkTexture = '/pong/PowerSpark.png',
      PowerGhostTexture = '/pong/PowerGhost.png',
      FireballJSON = '/pong/Fireball.json',
      FireballAnimDict = '/pong/Fireball',
    }
    export type All = GroupEndpointTargets<Targets>;

    /* PUT methods */
    export interface NewLobby
      extends Endpoint<
        EndpointMethods.Put,
        Targets.NewLobby,
        Models.ILobby,
        {
          password: string | null;
          name: string;
          spectators: PongModel.Models.LobbySpectatorVisibility;
          lobbyType: PongModel.Models.LobbyType;
          gameType: PongModel.Models.LobbyGameType;
        }
      > {}

    export interface LeaveLobby
      extends Endpoint<
        EndpointMethods.Put,
        Targets.LeaveLobby,
        undefined,
        {
          lobbyId: number;
        }
      > {}

    /* POST methods */
    export interface JoinLobby
      extends Endpoint<
        EndpointMethods.Post,
        Targets.JoinLobby,
        Models.ILobby,
        {
          lobbyId: number;
          password: string | null;
        }
      > {}

    export interface ChangeTeam
      extends Endpoint<
        EndpointMethods.Post,
        Targets.ChangeTeam,
        undefined,
        {
          teamId: Models.TeamSide;
          teamPosition: number;
          lobbyId: number;
        }
      > {}

    export interface ChangeOwner
      extends Endpoint<
        EndpointMethods.Post,
        Targets.ChangeOwner,
        undefined,
        { lobbyId: number; ownerToBe: number }
      > {}

    export interface JoinSpectators
      extends Endpoint<
        EndpointMethods.Post,
        Targets.JoinSpectators,
        undefined,
        { lobbyId: number }
      > {}

    export interface Ready
      extends Endpoint<
        EndpointMethods.Post,
        Targets.Ready,
        undefined,
        {
          lobbyId: number;
        }
      > {}

    export interface Kick
      extends Endpoint<
        EndpointMethods.Post,
        Targets.Kick,
        undefined,
        {
          lobbyId: number;
          userId: number;
        }
      > {}

    export interface ChatSelectedData {
      id: number;
      type: string;
    }

    export interface Invite
      extends Endpoint<
        EndpointMethods.Post,
        Targets.Invite,
        Models.ILobby,
        {
          lobbyId?: number;
          data: ChatSelectedData[];
        }
      > {}

    /* GET methods */

    export interface GetSessionLobby
      extends GetEndpoint<Targets.GetSessionLobby, Models.ILobby> {}

    export interface GetAllLobbies
      extends GetEndpoint<
        Targets.GetAllLobbies,
        Models.ILobbyInfoDisplay[],
        {
          active?: boolean; // true for spectator, false for joinable
        }
      > {}

    export interface GetLobby
      extends GetEndpoint<Targets.GetLobby, Models.ILobbyInfoDisplay | null> {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetSessionLobby]: GetSessionLobby;
        [Targets.GetAllLobbies]: GetAllLobbies;
        [Targets.GetLobby]: GetLobby;
      };
      [EndpointMethods.Put]: {
        [Targets.NewLobby]: NewLobby;
        [Targets.LeaveLobby]: LeaveLobby;
      };
      [EndpointMethods.Post]: {
        [Targets.JoinLobby]: JoinLobby;
        [Targets.JoinSpectators]: JoinSpectators;
        [Targets.ChangeTeam]: ChangeTeam;
        [Targets.ChangeOwner]: ChangeOwner;
        [Targets.Ready]: Ready;
        [Targets.Kick]: Kick;
        [Targets.Invite]: Invite;
      };
    }
  }
}

export default PongModel;
