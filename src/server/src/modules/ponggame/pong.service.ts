import { ForbiddenException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PongLobby, PongLobbyParticipant } from '../ponglobbies/ponglobby';
import { ServerGame } from './pong';
import PongModel from '@typings/models/pong';
import { Server } from 'socket.io';
import { ClientSocket } from '@typings/ws';
import { PongHistoryService } from '../ponghistory/history.service';
import { PongLobbyService } from '../ponglobbies/ponglobby.service';
import User from '../users/user';

@Injectable()
export class PongService {
  public clientInGames = new Map<number, string>(); // userId, gameUUID
  public games = new Map<string, ServerGame>();
  public readonly server: Server;
  constructor(
    public historyService: PongHistoryService,
    @Inject(forwardRef(() => PongLobbyService))
    private readonly lobbyService: PongLobbyService,
  ) {}

  // maybe create a new node js thread for each game (?)

  public async joinActive(user: User, uuid: string): Promise<PongLobby> {
    const game = this.getGame(uuid);
    if (!game) throw new ForbiddenException('Game not found');

    if (this.clientInGames.has(user.id))
      throw new ForbiddenException('User already in game');

    // check lobby type
    const visibility = game.lobbyInterface.spectatorVisibility;
    if (visibility === PongModel.Models.LobbySpectatorVisibility.None) {
      throw new ForbiddenException('Spectators not allowed');
    } else if (
      visibility === PongModel.Models.LobbySpectatorVisibility.Friends
    ) {
      const players = game.config.teams[0].players.concat(
        game.config.teams[1].players,
      );
      let isFriend = false;
      players.filter((player) => {
        if (user.friends.is(player.userId)) {
          isFriend = true;
        }
      });
      if (!isFriend) {
        throw new ForbiddenException('You are not a friend');
      }
    }

    const lobby = await this.lobbyService.getLobby(game.lobbyInterface.id);
    if (!lobby) throw new ForbiddenException('Lobby not found');

    await this.lobbyService.joinLobby(user, lobby.id, null, undefined, false, true);
    await this.lobbyService.joinSpectators(user, lobby.id);
    return lobby;
  }

  public getAllGames(): PongModel.Models.IGameInfoDisplay[] {
    return Array.from(this.games.values()).map((game) => game.gameInfo);
  }

  public getGame(uuid: string): ServerGame | undefined {
    return this.games.get(uuid);
  }

  public async initGameSession(
    lobby: PongLobby,
    lobbyService: PongLobbyService,
    pongService: PongService,
  ): Promise<ServerGame> {
    const lobbyInterface = lobby.interface;
    const uuid = this.createUUID();
    const gameConfig = this.parseLobbyPlayers(lobbyInterface, uuid);
    const newGame = new ServerGame(
      lobbyInterface,
      gameConfig,
      this.server,
      this.historyService,
      lobbyService,
      pongService,
    );
    this.games.set(uuid, newGame);
    return newGame;
  }

  public handleUpdateDisconnected(client: ClientSocket, roomId: string) {
    const game = this.getGame(roomId);
    if (!game || game.started === false) return;
    console.log(
      `Game ${game.UUID}: received updateDisconnected from ${client.data.user.id}`,
    );
    const disconnectedPlayers = game.config.teams[0].players
      .concat(game.config.teams[1].players)
      .filter((player) => player.connected === false);
    if (disconnectedPlayers.length === 0) return;
    console.log(disconnectedPlayers.map((player) => player.userId));
    client.emit(PongModel.Socket.Events.UpdateDisconnected, {
      userIds: disconnectedPlayers.map((player) => player.userId),
    });
  }

  public handleFocusLoss(client: ClientSocket, roomId: string): void {
    const game = this.getGame(roomId.toString());
    if (!game || game.started === false) return;
    game.handleFocusLoss(client.data.user.id);
  }

  public handleKeys(
    client: ClientSocket,
    data: { key: string; state: boolean },
  ): void {
    const game = this.getGameByPlayerId(client.data.user.id);
    if (!game || game.started === false) return;
    game.handleKeys(client.data.user.id, data.key, data.state);
  }

  public getGameByPlayerId(playerId: number): ServerGame | undefined {
    const uuid = this.clientInGames.get(playerId);
    if (!uuid) return undefined;
    const game = this.games.get(uuid);
    if (!game) return undefined;
    return game;
  }

  private parseLobbyPlayers(
    lobby: PongModel.Models.ILobby,
    uuid: string,
  ): PongModel.Models.IGameConfig {
    // FIX THESE VALUES "PLAYER" values
    const teams = lobby.teams.map((team) => {
      const players: PongModel.Models.IPlayerConfig[] = team.players.map(
        (player) => {
          let playerNbr;
          let position: 'back' | 'front';
          if (player.teamPosition === PongModel.Models.TeamPosition.Top) {
            position = 'back';
            player.teamId === 0
              ? (playerNbr = PongModel.InGame.ObjType.Player1)
              : (playerNbr = PongModel.InGame.ObjType.Player2);
          } else {
            position = 'front';
            player.teamId === 0
              ? (playerNbr = PongModel.InGame.ObjType.Player3)
              : (playerNbr = PongModel.InGame.ObjType.Player4);
          }
          console.log(player.paddle);
          return {
            tag: playerNbr,
            teamId: team.id,
            type: player.type,
            keys: player.keys,
            specialPower:
              player.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
            paddle: player.paddle,
            positionOrder: position,
            userId: player.id,
            avatar: player.avatar,
            nickname: player.nickname,
            connected: player.type === 'bot' ? true : false,
            scored: 0,
          };
        },
      );
      return {
        id: team.id,
        players: players,
        score: 0,
      };
    }) as [PongModel.Models.IGameTeam, PongModel.Models.IGameTeam];

    const spectators: number[] = lobby.spectators.map((spectator) => {
      return spectator.id;
    });

    return {
      UUID: uuid,
      teams: teams,
      spectators: spectators,
      nPlayers: lobby.nPlayers,
      ballTexture: lobby.ballTexture,
      maxScore: lobby.score,
      ownerId: lobby.ownerId,
    };
  }

  private createUUID(): string {
    return uuidv4();
  }
}
