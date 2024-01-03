import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PongLobby } from '../ponglobbies/ponglobby';
import { ServerGame } from './pong';
import PongModel from '@typings/models/pong';
import { Server } from 'socket.io';
import { ClientSocket } from '@typings/ws';

@Injectable()
export class PongService {
  public clientInGames = new Map<number, string>(); // userId, gameUUID
  private games = new Map<string, ServerGame>();
  public readonly server: Server;
  constructor() {}

  // maybe create a new node js thread for each game (?)

  public getGame(uuid: string): ServerGame | undefined {
    return this.games.get(uuid);
  }

  public async initGameSession(lobby: PongLobby): Promise<ServerGame> {
    const lobbyInterface = lobby.interface;
    const uuid = this.createUUID();
    const gameConfig = this.parseLobbyPlayers(lobbyInterface, uuid);
    const newGame = new ServerGame(lobbyInterface, gameConfig, this.server);
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

  public handleKeys(
    client: ClientSocket,
    data: { key: string; state: boolean },
  ): void {
    const game = this.getGameByPlayerId(client.data.user.id);
    if (!game || game.started === false) return;
    console.log(
      `Game ${game.UUID}: received keypress from ${client.data.user.id}`,
    );
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
            player.teamId === 0 ? (playerNbr = PongModel.InGame.ObjType.Player1) : (playerNbr = PongModel.InGame.ObjType.Player2);
          } else {
            position = 'front';
            player.teamId === 0 ? (playerNbr = PongModel.InGame.ObjType.Player3) : (playerNbr = PongModel.InGame.ObjType.Player4);
          }
          
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
            connected: false,
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
    };
  }

  private createUUID(): string {
    return uuidv4();
  }
}
