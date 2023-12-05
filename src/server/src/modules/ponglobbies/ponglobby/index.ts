import PongModel from '@typings/models/pong';
import { PongLobbyDependencies } from './dependencies';
import User from '@/modules/users/user';
import { GroupEnumValues } from '@typings/utils';

/* ---- LOBBY PARTICIPANT ---- */

export class PongLobbyParticipant
  implements PongModel.Models.ILobbyParticipant
{
  public keys: PongModel.Models.IGamekeys =
    PongModel.Models.TemporaryLobbyParticipant.keys;
  public paddleTexture: string =
    PongModel.Models.TemporaryLobbyParticipant.paddleTexture;
  public specialPower: GroupEnumValues<PongModel.Models.LobbyParticipantSpecialPowerType> =
    PongModel.Models.TemporaryLobbyParticipant.specialPower;
  public status: GroupEnumValues<PongModel.Models.LobbyStatus> =
    PongModel.Models.LobbyStatus.Waiting;
  public role: GroupEnumValues<PongModel.Models.LobbyParticipantRole> =
    PongModel.Models.LobbyParticipantRole.Player;
  public privileges: GroupEnumValues<PongModel.Models.LobbyParticipantPrivileges> =
    PongModel.Models.LobbyParticipantPrivileges.None;
  public teamId: PongModel.Models.TeamSide | null = null;
  constructor(
    user: User,
    lobby: PongLobby,
    public id: number = user.id,
    public nickname: string = user.nickname,
    public avatar: string = user.avatar,
    public lobbyId: number = lobby.id,
  ) {
    if (lobby.nPlayers < 4) lobby.addPlayerToPlayers(this);
    else lobby.addPlayerToSpectators(this);
  }

  public get interface(): PongModel.Models.ILobbyParticipant {
    return {
      id: this.id,
      nickname: this.nickname,
      avatar: this.avatar,
      lobbyId: this.lobbyId,
      role: this.role,
      privileges: this.privileges,
      teamId: this.teamId,
      status: this.status,
      keys: this.keys,
      paddleTexture: this.paddleTexture,
      specialPower: this.specialPower,
    };
  }
}

/* ---- LOBBY ---- */

export class PongLobby implements PongModel.Models.ILobby{
  public id: number = 0;
  public ownerId: number = 0;
  public name: string = "";
  public queueType: GroupEnumValues<PongModel.Models.LobbyType> = PongModel.Models.LobbyType.Custom;
  public gameType: GroupEnumValues<PongModel.Models.LobbyGameType> = PongModel.Models.LobbyGameType.Powers;
  public spectatorVisibility: GroupEnumValues<PongModel.Models.LobbySpectatorVisibility> = PongModel.Models.LobbySpectatorVisibility.All;
  public status: GroupEnumValues<PongModel.Models.LobbyStatus> = PongModel.Models.LobbyStatus.Waiting;
  public authorization: GroupEnumValues<PongModel.Models.LobbyAccess> = PongModel.Models.LobbyAccess.Public;
  public authorizationData: PongModel.Models.ILobbyAuthorizationData | null = null;
  public nPlayers: number = 0;
  public teams: [PongModel.Models.ITeam, PongModel.Models.ITeam] = [
    {
      id: PongModel.Models.TeamSide.Left,
      players: [],
      score: 0,
    },
    {
      id: PongModel.Models.TeamSide.Right,
      players: [],
      score: 0,
    },
  ];
  public spectators: PongModel.Models.ILobbyParticipant[] = [];

  constructor(
    public readonly helpers: PongLobbyDependencies,
    data: {
      password: string | null;
      name: string;
      spectators: PongModel.Models.LobbySpectatorVisibility;
      lobbyType: PongModel.Models.LobbyType;
      gameType: PongModel.Models.LobbyGameType;
    },
    lobbyId: number,
  ) {
    this.id = lobbyId;
    this.name = data.name;
    this.queueType = data.lobbyType;
    this.gameType = data.gameType;
    this.spectatorVisibility = data.spectators;
    this.setAuthorization(data.password);
  }

  public removePlayerFromSpectator(player: PongModel.Models.ILobbyParticipant): void {
    const newSpectators = this.spectators.filter((p) => p.id !== player.id);
    if (newSpectators.length === 0) return;
    else {
      this.spectators = newSpectators;
    }
  }

  private getPlayerFromTeam(userId: number): PongModel.Models.ILobbyParticipant {
    const team = this.teams.find((team) =>
      team.players.some((player) => player.id === userId),
    );
    console.log("TEAM", team)
    if (!team) throw new Error('User is not in a team');
    const player = team.players.find((player) => player.id === userId);
    console.log("PLAYER", player)
    if (!player) throw new Error('User is not in a team');
    return player;
  }

  public removePlayerFromTeam(userId: number):void {
    const player = this.getPlayerFromTeam(userId);
    const teamSide = player.teamId!;
    const team = this.teams[teamSide];
    if (team.players.length === 1) {
      team.players.pop();
    } else {
      team.players.splice(team.players.indexOf(player), 1);
    }
    this.nPlayers--;
  }

  private get allInLobby(): PongModel.Models.ILobbyParticipant[] {
    return this.teams[0].players.concat(this.teams[1].players).concat(this.spectators);
  }

  public syncParticipants(): void {
    this.helpers.sseService.emitToTargets<PongModel.Sse.UpdateLobbyParticipantEvent>(
      PongModel.Sse.Events.UpdateLobbyParticipants,
      this.allInLobby.map((player) => player.id),
      {
        id: this.id,
        teams: this.teams,
        spectators: this.spectators,
        ownerId: this.ownerId,
      },
    )
  }

  public removePlayer(userId: number):void {
    // team or spectator
    // if owner change ownership
    if (this.spectators.some((player) => player.id === userId)) {
      const player = this.spectators.find((player) => player.id === userId)!;
      this.removePlayerFromSpectator(player);
      console.log(`Lobby-${this.id}: ${player.nickname} left. (Was in spectators)`);
    } else {
      this.removePlayerFromTeam(userId);
    }
    if (this.ownerId === userId) {
      // does this work?
      const newOwner = this.teams[0].players[0] || this.teams[1].players[0] || this.spectators[0];
      if (newOwner) {
        console.log("NEW OWNER : ", newOwner)
        this.ownerId = newOwner.id;
        newOwner.privileges = PongModel.Models.LobbyParticipantPrivileges.Owner;
      }
    }
    this.syncParticipants();
  }

  public setPrivileges(
    player: PongLobbyParticipant,
    privileges: GroupEnumValues<PongModel.Models.LobbyParticipantPrivileges>,
  ) {
    this.ownerId = player.id;
    player.privileges = privileges;
  }

  public get interface(): PongModel.Models.ILobby {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      queueType: this.queueType,
      gameType: this.gameType,
      spectatorVisibility: this.spectatorVisibility,
      status: this.status,
      authorization: this.authorization,
      authorizationData: this.authorizationData,
      nPlayers: this.nPlayers,
      teams: this.teams,
      spectators: this.spectators,
    };
  }

  public get infoDisplay(): PongModel.Models.ILobbyInfoDisplay {
    return {
      id: this.id,
      name: this.name,
      gameType: this.gameType,
      spectatorVisibility: this.spectatorVisibility,
      status: this.status,
      authorization: this.authorization,
      nPlayers: this.nPlayers,
      ownerId: this.ownerId,
      spectators: this.spectators.length,
    };
  }

  public addToTeam(
    player: PongLobbyParticipant,
    teamSide: PongModel.Models.TeamSide,
  ) {
    player.teamId = PongModel.Models.TeamSide.Left;
    player.status = PongModel.Models.LobbyStatus.Waiting;
    this.teams[teamSide].players.push(player);
  }

  public addPlayerToPlayers(player: PongLobbyParticipant): void {
    player.role = PongModel.Models.LobbyParticipantRole.Player;
    if (this.nPlayers % 2 === 0)
      this.addToTeam(player, PongModel.Models.TeamSide.Left);
    else this.addToTeam(player, PongModel.Models.TeamSide.Right);
    this.nPlayers++;
  }
  public addPlayerToSpectators(player: PongLobbyParticipant): void {
    player.role = PongModel.Models.LobbyParticipantRole.Spectator;
    player.teamId = null;
    player.privileges = PongModel.Models.LobbyParticipantPrivileges.None;
    player.status = PongModel.Models.LobbyStatus.Waiting;
    this.spectators.push(player);
  }

  public setGameType(type: PongModel.Models.LobbyGameType) {
    this.gameType = type;
  }

  public setQueueType(type: PongModel.Models.LobbyType) {
    this.queueType = type;
  }

  public setAuthorization(password: string | null) {
    if (!password) {
      this.authorization = PongModel.Models.LobbyAccess.Public;
    } else {
      this.authorization = PongModel.Models.LobbyAccess.Protected;
      this.authorizationData = {
        password,
      };
    }
  }
}
