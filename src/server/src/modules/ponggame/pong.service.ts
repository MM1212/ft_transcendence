import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PongLobby } from '../ponglobbies/ponglobby';
import { ServerGame } from './pong';
import PongModel from '@typings/models/pong';
import { Server } from 'socket.io';

@Injectable()
export class PongService {
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
