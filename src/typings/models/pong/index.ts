import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  Endpoints,
  GetEndpoint,
  GroupEndpointTargets,
  SseModel,
} from "@typings/api";
import { GroupEnumValues } from "@typings/utils";
import NotificationsModel from "../notifications";

namespace PongModel {
  export namespace InGame {
    export enum ObjType {
      Ball = "Bolinha",
      Player1 = "Player 1",
      Player2 = "Player 2",
      Player3 = "Player 3",
      Player4 = "Player 4",
      Arena = "Arena",
    }
  }

  export namespace Models {
    export enum LobbyType {
      Single = "SINGLE", // Single Queue Mode
      Double = "DOUBLE", // Double Queue Mode
      Custom = "CUSTOM", // Custom mode
    }
    export enum LobbyGameType {
      Classic = "CLASSIC", // Classic pong
      Powers = "POWERS", // Pong with super powers
    }
    export enum LobbyAccess {
      Public = "PUBLIC", // Anyone can join
      Protected = "PROTECTED", // Password protected
      Private = "PRIVATE", // Queue mode
    }
    export enum LobbyStatus {
      Waiting = "WAITING",
      Ready = "READY",
      Playing = "PLAYING",
      Finished = "FINISHED",
    }
    export enum LobbySpectatorVisibility {
      All = "ALL", // Anyone can spectate
      Friends = "FRIENDS", // Only friends can spectate
      None = "NONE", // No one can spectate
    }
    export interface ILobbyAuthorizationData {
      password?: string;
    }
    export enum LobbyParticipantRole {
      Player = "PLAYER", // Player
      Spectator = "SPECTATOR", // Spectator
    }
    export enum LobbyParticipantPrivileges {
      None = "NONE", // No privileges
      Owner = "OWNER", // Lobby "admin"
    }
    export enum LobbyParticipantSpecialPowerType {
      bubble = "bubble",
      spark = "spark",
      ice = "ice",
      fire = "fire",
      ghost = "ghost",
    }
    export enum TeamSide {
      Left,
      Right,
    }
    export enum TeamPosition {
      Top,
      Bottom,
    }

    export enum Balls {
      Red = "RedBall",
      Coffee = "Coffee",
      Earth = "Earth",
      Fire = "Fire",
      Fog = "Fog",
      Ice = "Ice",
      Light = "Light",
      Void = "Void",
      Wind = "Wind",
    }

    export type IGameKeyTypes = "up" | "down" | "boost" | "shoot";
    export type IGamekeys = Record<IGameKeyTypes, string>;
    export const DEFAULT_GAME_KEYS: IGamekeys = {
      up: "w",
      down: "s",
      boost: "a",
      shoot: "q",
    };

    export interface ITeam {
      players: ILobbyParticipant[];
      score: number;
      id: TeamSide;
    }
    export const TemporaryLobbyParticipant = {
      keys: PongModel.Models.DEFAULT_GAME_KEYS,
      paddle: "PaddleRed",
      specialPower: PongModel.Models.LobbyParticipantSpecialPowerType.spark,
    };
    export interface ILobbyParticipant {
      id: number;
      avatar: string;
      type: string;
      nickname: string;
      lobbyId: number;
      role: GroupEnumValues<LobbyParticipantRole>;
      privileges: GroupEnumValues<LobbyParticipantPrivileges>;
      teamId: TeamSide | null;
      status: GroupEnumValues<LobbyStatus>;
      keys?: IGamekeys;
      paddle: string;
      specialPower: GroupEnumValues<LobbyParticipantSpecialPowerType>;
      teamPosition: number;
    }
    export interface ILobby {
      id: number;
      nonce: number;
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
      ballTexture: string;
      score: number;
    }

    export interface IPlayerConfig {
      tag: string;
      teamId: number;
      type: string;
      keys?: IGamekeys;
      specialPower: LobbyParticipantSpecialPowerType;
      paddle: string;
      positionOrder: "back" | "front";
      userId: number;
      avatar: string;
      nickname: string;
      connected: boolean;
      scored: number;
    }

    export interface ILobbyUpdateSettings {
      lobbyId: number;
      score: number;
      type: boolean;
      ballSkin: string;
    }

    export interface IGameTeam {
      players: IPlayerConfig[];
      score: number;
      id: TeamSide;
    }
    export interface IGameConfig {
      UUID: string;
      teams: [IGameTeam, IGameTeam];
      spectators: number[];
      nPlayers: number;
      maxScore: number;
      ownerId: number;
      gametype: GroupEnumValues<LobbyGameType>;
      //backgroundTexture: string;
      ballTexture: string;
    }

    export interface ILobbyInfoDisplay
      extends Pick<
        ILobby,
        | "id"
        | "name"
        | "gameType"
        | "spectatorVisibility"
        | "status"
        | "authorization"
        | "nPlayers"
        | "ownerId"
        | "score"
        | "nonce"
      > {
      spectators: number;
    }

    export interface IGameInfoDisplay {
      UUID: string;
      score: [number, number];
      teams: [IGameTeam, IGameTeam];
      maxScore: number;
      spectatorVisibility: GroupEnumValues<LobbySpectatorVisibility>;
    }

    export interface ILobbyUpdateParticipantsEvent
      extends Pick<ILobby, "id" | "teams" | "spectators" | "ownerId"> {
      ownerId: number;
    }

    export interface ILobbyKickParticipantPayload extends ILobby {}

    export interface ILobbyUpdateInvitedPayload
      extends Pick<ILobby, "invited"> {}

    export interface ILobbyLeavePayload extends ILobby {}

    export interface ILobbyJoinPayload extends ILobby {}

    export interface IStartGamePayload extends Pick<ILobby, "id" | "status"> {}

    export enum InviteSource {
      Lobby = "lobby",
      Chat = "chat",
    }

    export interface NotificationInvite
      extends NotificationsModel.Models.INotification<{
        lobbyId: number;
        nonce: number;
        authorization: GroupEnumValues<LobbyAccess>;
      }> {}
  }

  export namespace Sse {
    export enum Events {
      NewLobby = "pong.new-lobby",
      UpdateLobbyParticipants = "pong.update-lobby-participants",
      UpdateLobbyInvited = "pong.update-lobby-invited",
      UpdateLobbySettings = "pong.update-lobby-settings",
      Kick = "pong.kick-participant",
      Start = "pong.start",
      Leave = "pong.leave",
      Join = "pong.join",
    }

    export interface UpdateLobbyParticipantEvent
      extends SseModel.Models.Event<
        Models.ILobbyUpdateParticipantsEvent,
        Events.UpdateLobbyParticipants
      > {}

      export interface UpdateLobbySettings
      extends SseModel.Models.Event<
        Models.ILobbyUpdateSettings,
        Events.UpdateLobbySettings> {}

    export interface Kick
      extends SseModel.Models.Event<
        Models.ILobbyKickParticipantPayload,
        Events.Kick
      > {}

    export interface UpdateLobbyInvited
      extends SseModel.Models.Event<
        Models.ILobbyUpdateInvitedPayload,
        Events.UpdateLobbyInvited
      > {}

    export interface Leave
      extends SseModel.Models.Event<Models.ILobbyLeavePayload, Events.Leave> {}

    export interface Join
      extends SseModel.Models.Event<Models.ILobbyJoinPayload, Events.Join> {}

    export interface Start
      extends SseModel.Models.Event<Models.IStartGamePayload, Events.Start> {}
  }

  export namespace Socket {
    export enum Events {
      UpdateMovements = "object-movements",
      SetUI = "set-ui-game",
      Start = "start-game",
      TimeStart = "time-start",
      Stop = "stop-game",
      RemovePower = "remove-power",
      CreatePower = "create-power",
      ShootPower = "shoot-power",
      UpdateShooter = "update-shooter",
      EffectCreateRemove = "effect-create-remove",
      UpdateScore = "update-score",
      KeyPress = "keyPress",
      Disconnected = "disconnected",
      Reconnected = "reconnected",
      AlreadyConnected = "already-connected",
      UpdatePaddleSizes = "update-paddle-sizes",
      UpdateDisconnected = "update-disconnected",
      EnergyManaUpdate = "energy-mana-update",
      FocusLoss = "focus-loss",
      Countdown = "countdown",
    }

    export namespace Data {
      export interface SetUIGame {
        state: boolean;
        config: Models.IGameConfig;
      }

      export interface UpdateMovements {
        tag: string;
        position: [number, number];
      }

      export interface RemovePower {
        tag: string[];
      }
      export interface CreatePower {
        tag: string;
        powertag: string;
      }
      export interface ShootPower {
        tag: string;
      }

      export interface UpdateShooter {
        tag: string;
        line: { start: [number, number]; end: [number, number] };
      }

      export interface EffectCreateRemove {
        tag: string;
        effectName: string | undefined;
        option: number;
      }

      export interface PaddleInfo {
        tag: string;
        scale: number;
        height: number;
        width: number;
        x: number;
        y: number;
      }

      export interface UpdatePaddleSizes {
        paddles: PaddleInfo[];
      }

      export interface UpdateDisconnected {
        userIds: number[];
      }

      export interface UpdateScore {
        score: [number, number];
        paddles: PaddleInfo[];
      }

      export interface Disconnected {
        tag: string;
        nickname: string;
      }

      export interface Reconnected {
        tag: string;
        nickname: string;
      }

      export interface EnergyManaUpdate {
        tag: string;
        energy: number;
        mana: number;
      }

      export interface Countdown {
        countdown: number;
      }

      export interface TimeStart {
        time_start: number;
      }
    }
  }

  export namespace DTO {
    export interface CreateLobby {
      password: string | null;
      name: string;
      spectators: PongModel.Models.LobbySpectatorVisibility;
      lobbyType: PongModel.Models.LobbyType;
      lobbyAccess: PongModel.Models.LobbyAccess;
      gameType: PongModel.Models.LobbyGameType;
      score: number;
    }

    export interface CheckId {
      lobbyId: number;
    }

    export interface JoinActive {
      uuid: string;
    }

    export interface JoinLobby {
      lobbyId: number;
      nonce: number;
      password: string | null;
    }

    export interface ChangeTeam {
      teamId: Models.TeamSide;
      teamPosition: number;
      lobbyId: number;
    }

    export interface ChangeOwner {
      lobbyId: number;
      ownerToBe: number;
    }

    export interface Kick {
      lobbyId: number;
      userId: number;
    }

    export interface Invite {
      lobbyId?: number;
      data: Endpoints.ChatSelectedData[];
      source: Models.InviteSource;
    }

    export interface AddBot {
      lobbyId: number;
      teamId: number;
      teamPosition: number;
    }

    export interface UpdateLobbySettings {
      lobbyId: number;
      score: number;
      type: boolean;
      ballSkin: string;
    }
  }

  export namespace Endpoints {
    export enum Targets {
      // PUT
      NewLobby = "/pong/lobby",
      LeaveLobby = "/pong/lobby/leave",
      AddToQueue = "/pong/lobby/addToQueue",
      //POST
      JoinLobby = "/pong/lobby/join",
      ChangeTeam = "/pong/lobby/team",
      ChangeOwner = "/pong/lobby/owner",
      JoinSpectators = "/pong/lobby/spectators",
      Ready = "/pong/lobby/ready",
      Kick = "/pong/lobby/kick",
      Invite = "/pong/lobby/invite",
      KickInvited = "/pong/lobby/kick-invited",
      StartGame = "/pong/lobby/start",
      LeaveQueue = "/pong/lobby/leaveQueue",
      JoinActive = "/pong/lobby/joinActive",
      AddBot = "/pong/lobby/addBot",
      UpdateLobbySettings = "/pong/lobby/updateSettings",
      //GET
      GetSessionLobby = "/pong/lobby/session",
      GetAllLobbies = "/pong/lobby/all",
      GetLobby = "/pong/lobby/:id",

      GetAllGames = "/pong/lobby/playing",

      Connect = "/pong",
      Assets = "/assets/pong",
      Paddles = "/assets/pong/Paddles",
      Background = "/assets/pong/UI/Background",
      Borders = "/assets/pong/UI/Borders",
      ManaBars = "/assets/pong/UI/UIBars/ManaBar",
      EnergyBars = "/assets/pong/UI/UIBars/EnergyBar",
      SpecialPowers = "/assets/pong/Powers",

      GhostDies = "/assets/pong/Powers/Ghost/Dies",
      GhostWalk = "/assets/pong/Powers/Ghost/Walk",
      GhostDiesJSON = "/assets/pong/Powers/Ghost/Dies/GhostDies.json",
      GhostWalkJSON = "/assets/pong/Powers/Ghost/Walk/GhostWalk.json",

      BubbleDies = "/assets/pong/Powers/Bubble/Dies",
      BubbleWalk = "/assets/pong/Powers/Bubble/Walk",
      BubbleDiesJSON = "/assets/pong/Powers/Bubble/Dies/BubbleDies.json",
      BubbleWalkJSON = "/assets/pong/Powers/Bubble/Walk/BubbleWalk.json",

      Shooter = "/assets/pong/Powers/Fire/Shooter",
      ShooterJSON = "/assets/pong/Powers/Fire/Shooter/Shooter.json",

      FireballWalk = "/assets/pong/Powers/Fire/Walk",
      FireballWalkJSON = "/assets/pong/Powers/Fire/Walk/FireballWalk.json",
      FireballDies = "/assets/pong/Powers/Fire/Dies",
      FireballDiesJSON = "/assets/pong/Powers/Fire/Dies/FireballDies.json",

      IceWalk = "/assets/pong/Powers/Ice/Walk",
      IceWalkJSON = "/assets/pong/Powers/Ice/Walk/IceWalk.json",
      IceDies = "/assets/pong/Powers/Ice/Dies",
      IceDiesJSON = "/assets/pong/Powers/Ice/Dies/IceDies.json",

      SparkWalk = "/assets/pong/Powers/Spark/Walk",
      SparkWalkJSON = "/assets/pong/Powers/Spark/Walk/SparkWalk.json",
      SparkDies = "/assets/pong/Powers/Spark/Dies",
      SparkDiesJSON = "/assets/pong/Powers/Spark/Dies/SparkDies.json",

      DisconnectWindow = "/assets/pong/UI/disconnect-window.webp",

      // UI representation
      PowerWaterTexture = "/assets/pong/Powers/Bubble/Walk/BubbleWalk0.webp",
      PowerFireTexture = "/assets/pong/Powers/Fire/Walk/FireballWalk0.webp",
      PowerIceTexture = "/assets/pong/Powers/Ice/Walk/IceWalk0.webp",
      PowerSparkTexture = "/assets/pong/Powers/Spark/Walk/SparkWalk0.webp",
      PowerGhostTexture = "/assets/pong/Powers/Ghost/Walk/GhostWalk0.webp",

      // Balls
      Balls = "/assets/pong/Balls",
      RedBallTexture = "/assets/pong/Balls/RedBall/RedBall.webp",
    }
    export type All = GroupEndpointTargets<Targets>;

    /* PUT methods */
    export interface NewLobby
      extends Endpoint<
        EndpointMethods.Put,
        Targets.NewLobby,
        Models.ILobby,
        DTO.CreateLobby
      > {}

    export interface UpdateLobbySettings
      extends Endpoint<
        EndpointMethods.Post,
        Targets.UpdateLobbySettings,
        undefined,
        DTO.UpdateLobbySettings
      > {}

    export interface LeaveLobby
      extends Endpoint<
        EndpointMethods.Put,
        Targets.LeaveLobby,
        undefined,
        DTO.CheckId
      > {}

    export interface AddToQueue
      extends Endpoint<
        EndpointMethods.Put,
        Targets.AddToQueue,
        undefined,
        DTO.CheckId
      > {}

    export interface LeaveQueue
      extends Endpoint<
        EndpointMethods.Put,
        Targets.LeaveQueue,
        undefined,
        DTO.CheckId
      > {}

    /* POST methods */
    export interface JoinLobby
      extends Endpoint<
        EndpointMethods.Post,
        Targets.JoinLobby,
        Models.ILobby,
        DTO.JoinLobby
      > {}

    export interface ChangeTeam
      extends Endpoint<
        EndpointMethods.Post,
        Targets.ChangeTeam,
        undefined,
        DTO.ChangeTeam
      > {}

    export interface ChangeOwner
      extends Endpoint<
        EndpointMethods.Post,
        Targets.ChangeOwner,
        undefined,
        DTO.ChangeOwner
      > {}

    export interface JoinSpectators
      extends Endpoint<
        EndpointMethods.Post,
        Targets.JoinSpectators,
        undefined,
        DTO.CheckId
      > {}

    export interface Ready
      extends Endpoint<
        EndpointMethods.Post,
        Targets.Ready,
        undefined,
        DTO.CheckId
      > {}

    export interface Kick
      extends Endpoint<
        EndpointMethods.Post,
        Targets.Kick,
        undefined,
        DTO.Kick
      > {}

    export interface KickInvited
      extends Endpoint<
        EndpointMethods.Post,
        Targets.KickInvited,
        undefined,
        DTO.Kick
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
        DTO.Invite
      > {}

    export interface StartGame
      extends Endpoint<
        EndpointMethods.Post,
        Targets.StartGame,
        undefined,
        DTO.CheckId
      > {}

    export interface JoinActive
      extends Endpoint<
        EndpointMethods.Post,
        Targets.JoinActive,
        Models.ILobby,
        DTO.JoinActive
      > {}

    export interface AddBot
      extends Endpoint<
        EndpointMethods.Post,
        Targets.AddBot,
        undefined,
        DTO.AddBot
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
      extends GetEndpoint<
        Targets.GetLobby,
        Models.ILobbyInfoDisplay | null,
        {
          id: number;
          nonce: number;
        }
      > {}

    export interface GetAllGames
      extends GetEndpoint<
        Targets.GetAllGames,
        Models.IGameInfoDisplay[] | null,
        {}
      > {}
    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetSessionLobby]: GetSessionLobby;
        [Targets.GetAllLobbies]: GetAllLobbies;
        [Targets.GetLobby]: GetLobby;
        [Targets.GetAllGames]: GetAllGames;
      };
      [EndpointMethods.Put]: {
        [Targets.NewLobby]: NewLobby;
        [Targets.LeaveLobby]: LeaveLobby;
        [Targets.AddToQueue]: AddToQueue;
        [Targets.LeaveQueue]: LeaveQueue;
      };
      [EndpointMethods.Post]: {
        [Targets.JoinLobby]: JoinLobby;
        [Targets.JoinSpectators]: JoinSpectators;
        [Targets.ChangeTeam]: ChangeTeam;
        [Targets.ChangeOwner]: ChangeOwner;
        [Targets.Ready]: Ready;
        [Targets.Kick]: Kick;
        [Targets.Invite]: Invite;
        [Targets.KickInvited]: KickInvited;
        [Targets.StartGame]: StartGame;
        [Targets.JoinActive]: JoinActive;
        [Targets.AddBot]: AddBot;
        [Targets.UpdateLobbySettings]: UpdateLobbySettings;
      };
    }
  }
}

export default PongModel;
