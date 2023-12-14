import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PongLobby } from '../ponglobbies/ponglobby';
import { ServerGame } from './pong';
import PongModel from '@typings/models/pong';
import { Server } from 'socket.io';
import { ClientSocket } from '@typings/ws';
import { SHOOT_ACTION } from '@shared/Pong/Paddles/Player';

@Injectable()
export class PongService {
  public clientInGames = new Map<number, string>(); // userId, gameUUID
  private games = new Map<string, ServerGame>();
  public readonly server: Server;
  constructor() {}

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

  public handleKeys(
    client: ClientSocket,
    data: { key: string; state: boolean },
  ): void {
    const game = this.getGameByPlayerId(client.data.user.id);
    if (!game || game.started === false) return;
    console.log(`Game ${game.UUID}: received keypress from ${client.data.user.id}`);
    const player = game.getPlayerInstanceById(client.data.user.id);
    if (player) {
      console.log(`Player ${player.tag} pressed ${data.key}`);
      if (data.state) {
        player.onKeyDown(data.key);
      } else {
        player.onKeyUp(data.key);
      }
      const [action, powertag] = player.handleShoot();
      switch (action) {
        case SHOOT_ACTION.CREATE:
          game.room.emit('create-power', {
            tag: player.tag,
            powertag: powertag,
          });
          break;
        case SHOOT_ACTION.SHOOT:
          game.room.emit('shoot-power', { tag: player.tag });
          break;
        default:
          break;
      }
    }
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
          return {
            tag: 'player',
            teamId: team.id,
            type: 'player',
            keys: player.keys,
            specialPower:
              player.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
            paddleTexture: player.paddleTexture,
            positionOrder:
              player.teamPosition === PongModel.Models.TeamPosition.Top
                ? 'back'
                : 'front',
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
    };
  }

  private createUUID(): string {
    return uuidv4();
  }
}
