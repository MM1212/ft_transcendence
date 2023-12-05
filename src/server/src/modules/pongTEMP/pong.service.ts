import { Injectable } from '@nestjs/common';
import { ServerGame } from './game';
import { Server, Socket } from 'socket.io';
import {
  ETeamSide,
  IGameConfig,
  IPlayerConfig,
} from '@shared/Pong/config/configInterface';
import { SHOOT_ACTION } from '@shared/Pong/Paddles/Player';

// temporary
const defaultLeftTeamConfig = {
  id: ETeamSide.Left,
  players: [],
  score: 0,
};
const defaultRightTeamConfig = {
  id: ETeamSide.Right,
  players: [],
  score: 0,
};

const defaultGameConfig: IGameConfig = {
  roomId: '',
  teams: [defaultLeftTeamConfig, defaultRightTeamConfig],
  partyOwnerId: '',
  spectators: [],
  backgroundColor: 0x000000,
  lineColor: 0xffffff,
  nPlayers: 0,
};

@Injectable()
export class PongService {
  private games = new Map<string, ServerGame>();
  private pongSessionsId = 1; // has to start with 1 because of the first room created being 0

  // add sse event dependency
  constructor() {}

  private changeGameConfigOptions(
    socket: Socket,
    data: { game: IGameConfig; player: IPlayerConfig },
    game: ServerGame,
  ) {
    data.game.roomId = game.roomId;

    game.config.backgroundColor = data.game.backgroundColor;
    game.config.lineColor = data.game.lineColor;

    game.config.partyOwnerId = data.player.userId;
  }

  private setPlayerConnectValues(socket: Socket, player: IPlayerConfig) {
    player.userId = socket.id;
    player.connected = true;
    player.ready = false;
  }

  public handleKeys(client: Socket, data: {key: string, state: boolean}): void {
    const game = this.getGameByPlayerId(client.id);
    if (game) {
      const player = game.getPlayerInstanceById(client.id);
      if (player) {
        if (data.state) {
          player.onKeyDown(data.key);
        }
        else {
          player.onKeyUp(data.key);
        }
        const [action, powertag] = player.handleShoot();
        switch (action) {
          case SHOOT_ACTION.CREATE:
            game.room.emit('create-power', {tag: player.tag, powertag: powertag});
            break;
          case SHOOT_ACTION.SHOOT:
            game.room.emit('shoot-power', {tag: player.tag});
            break;
          default:
            break;
        }
      } 
    }
  }

  

  public createGame(
    data: { game: IGameConfig; player: IPlayerConfig },
    server: Server,
    client: Socket,
  ): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (!data.game || !data.player) throw new Error('No data provided');
    if (this.canCreateGame(client) === false)
      throw new Error('Client is already in a game');
    if (this.isUserInGames(client) === true)
      throw new Error('Client is already in a game');
    const game = new ServerGame(data.game, server, this.pongSessionsId++);
    this.games.set(game.sessionId.toString(), game);
    this.setPlayerConnectValues(client, data.player);
    this.changeGameConfigOptions(client, data, game);
    game.createGameSettings(client, { game: data.game, player: data.player });
    console.log(`${client.id} created and joined ${game.roomId}`);
    return game.config;
  }

  public joinGame(
    client: Socket,
    data: { roomId: string; player: IPlayerConfig },
  ): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (!data.roomId || !data.player) throw new Error('No data provided');
    if (this.isUserInGames(client))
      throw new Error('Client is already in a game');
    if (!this.doesGameExist(data.roomId))
      throw new Error('Game does not exist');
    const game = this.games.get(data.roomId);
    if (!game) throw new Error('Game does not exist');
    if (this.isGameFull(game)) {
      this.setPlayerConnectValues(client, data.player);
      game.addSpectatorToGame(client, data.player);
      console.log(`${client.id} joined ${game.roomId}'s spectators`);
      return game.config;
    }
    this.setPlayerConnectValues(client, data.player);
    game.addPlayerToGame(client, data.player, undefined);
    console.log(`${client.id} joined ${game.roomId}`);
    return game.config;
  }

  public readyToPlay(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (this.isUserInGames(client) === false)
      throw new Error('Client is not in a game');
    const game = this.getGameByPlayerId(client.id)
    if (!game) throw new Error('You are not playing');
    game.playerReady(client.id);
    console.log(`socket ${client.id} clicked ready`);
    return game.config;
  }

  public startGame(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (this.isUserInGames(client) === false) throw new Error('Client is not in a game');
    const game = this.getGameByPlayerId(client.id);
    if (!game) throw new Error('Game does not exist');
    if (game.config.partyOwnerId !== client.id) throw new Error('Client is not the party owner');
    if (game.config.nPlayers < 2)
      throw new Error('Not enough players to start the game');
    if (this.everyoneIsReady(game) === false) throw new Error('Not everyone is ready');
    console.log(`Game ${game.roomId} is ready to start`);
    return game.config;
  }

  private everyoneIsReady(game: ServerGame): boolean {
    const team1 = game.config.teams[0].players;
    const team2 = game.config.teams[1].players;

    const players = team1.concat(team2);
    return players.every((player: IPlayerConfig) => player.ready === true);
  }

  public getAllGames(client: Socket): Array<string> {
    if (!client) throw new Error('No client provided');
    return Array.from(this.games.keys());
  }

  private getRandomPlayer(
    game: ServerGame,
    player: IPlayerConfig,
  ): IPlayerConfig | undefined {
    let otherPlayer = game.config.teams[0].players.find(
      (newPlayer: IPlayerConfig) => newPlayer.userId !== player.userId,
    );
    if (!otherPlayer) {
      otherPlayer = game.config.teams[1].players.find(
        (newPlayer: IPlayerConfig) => newPlayer.userId !== player.userId,
      );
    }
    return otherPlayer;
  }

  public leaveGame(client: Socket, roomId: string): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (!roomId) throw new Error('No room provided');
    if (this.isUserInGames(client) === false)
      throw new Error('Client is not in this game');
    const game = this.games.get(roomId);
    if (!game) throw new Error('Game does not exist');

    let player = game.getPlayer(client.id);
    if (!player){
      player = this.getSpectator(client.id, game.config.spectators);
      if (!player) throw new Error('Player does not exist');
      else this.spectatorLeaveGame(client, player, game);
    }
    else 
        this.playerLeaveGame(client, player, game);
    return game.config;
  }

  public switchPartyOwner(client: Socket, newOwnerId: string): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (!newOwnerId) throw new Error('No new owner provided');
    if (this.isUserInGames(client) === false)
      throw new Error('Client is not in this game');
    const game = this.getGameByPlayerId(client.id);
    if (!game) throw new Error('Game does not exist');
    if (game.config.partyOwnerId !== client.id)
      throw new Error('Client is not the party owner');
    const newOwner = game.getPlayer(newOwnerId);
    if (!newOwner) {
      if (this.getSpectator(newOwnerId, game.config.spectators)) {
        game.config.partyOwnerId = newOwnerId;
        return game.config;
      }
      else throw new Error('New owner does not exist');
    }
    game.config.partyOwnerId = newOwnerId;
    return game.config;
  }

  public joinSpectator(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    
    const game = this.getGameByPlayerId(client.id);
    if (!game) throw new Error('Game does not exist');

    const player = game.getPlayer(client.id);
    if (!player) throw new Error('Player does not exist / Is already a spectator');

    this.removePlayerFromTeam(client, player, game); // removes socket    
    game.addSpectatorToGame(client, player); //  joins socket again
    console.log(`${client.id} left team and joined ${game.roomId}'s spectators`);
    return game.config
  }

  public joinTeam(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    
    const game = this.getGameBySpectatorId(client.id);
    if (!game) throw new Error('Game does not exist / Is already a player');

    const player = this.getSpectator(client.id, game.config.spectators);
    if (!player) throw new Error('Player is not spectating');

    this.spectatorLeaveGame(client, player, game); // removes socket
    game.addPlayerToGame(client, player, undefined); // joins socket again
  
    console.log(`${client.id} left ${game.roomId}'s spectators and joined a team`);
    return game.config
  }
  
  private getSpectator(id: string, spectators: Array<IPlayerConfig>): IPlayerConfig | undefined {
    return spectators.find((spectator: IPlayerConfig) => spectator.userId === id);
  }

  private getGameBySpectatorId(spectatorId: string): ServerGame | undefined {
    if (!spectatorId) return undefined;
    const game = Array.from(this.games.values()).find((game) =>
      this.getSpectator(spectatorId, game.config.spectators),
    );
    return game;
  }

  private spectatorLeaveGame(client: Socket, player: IPlayerConfig, game: ServerGame): void {
    this.setNewRandomPartyOwner(client, player, game);
    const index = game.config.spectators.findIndex(
      (spectator: IPlayerConfig) => spectator.userId === client.id,
    );
    if (index > -1) {
      client.leave(game.roomId);
      game.config.spectators.splice(index, 1);
    } else {
      console.log('error deleting ' + client.id + ' from spectators');
      throw new Error('Error deleting spectator from spectators');
    }
    console.log(`${client.id} left ${game.roomId}'s spectators`);
  }

  // needs to send a request to the new owner to change the base config options
  private playerLeaveGame(client: Socket, player: IPlayerConfig, game: ServerGame): void {
    if (this.setNewRandomPartyOwner(client, player, game) === false) return;

    // if player
    this.removePlayerFromTeam(client, player, game);
  
    console.log(`${client.id} left ${game.roomId}`);
  }

  private removePlayerFromTeam(client: Socket, player: IPlayerConfig, game: ServerGame): void {
    const teamSide = player.teamId;
    const teamPlayers = game.config.teams[player.teamId].players;
    const index = game.getPlayerIndex(client.id);
    if (index > -1) {
      teamPlayers.splice(index, 1);
    } else {
      console.log('error deleting ' + client.id + ' from team');
      throw new Error('Error deleting player from team');
    }
    game.leaveGame(client);
    game.setBackOrFront(teamSide);
  }

  private setNewRandomPartyOwner(client: Socket, player: IPlayerConfig, game: ServerGame): boolean {
    if (player.userId === game.config.partyOwnerId) {
      // if player is last alone 
      if (game.config.nPlayers === 1 && game.config?.spectators.length === 0) {
        game.leaveGame(client);
        game.config = defaultGameConfig;
        return false;
      } else {
        // if there are other players
        let otherPlayer = this.getRandomPlayer(game, player);
        if (otherPlayer) {
          this.changeGameConfigOptions(
            client,
            { game: game.config, player: otherPlayer },
            game,
          );
        } else {
        // if there are no other players but there are spectators
          otherPlayer = this.getRandomSpectator(game);
          if (otherPlayer) {
            this.changeGameConfigOptions(
                client,
                { game: game.config, player: otherPlayer },
                game,
            );
          }
          else {
            // if there are no other players and no spectators
            game.leaveGame(client);
            game.config = defaultGameConfig;
            return false;
          }
        }
      }
    }
    return true;
  }

  private getRandomSpectator(game: ServerGame): IPlayerConfig | undefined {
    const spectators = game.config.spectators;
    if (spectators.length === 0) return undefined;
    const spectatorIndex = Math.floor(Math.random() * spectators.length);
    return spectators[spectatorIndex];
  }

  private canCreateGame(client: Socket): boolean {
    const roomIds = Array.from(client.rooms.values());
    return false === roomIds.some((id) => id.startsWith('game-'));
  }

  private isUserInGames(client: Socket): boolean {
    const roomIds = Array.from(client.rooms.values());
    return roomIds.some((id) => id.startsWith('game-'));
  }

  private isGameFull(game: ServerGame): boolean {
    return game.config.nPlayers === 4;
  }

  private doesGameExist(roomId: string): boolean {
    return this.games.has(roomId);
  }

  private canJoinGame(client: Socket, roomId: string): boolean {
    if (!client) throw new Error('No client provided');
    if (!roomId) return false;
    if (this.isUserInGames(client))
      throw new Error('Client is already in a game');
    if (!this.doesGameExist(roomId)) throw new Error('Game does not exist');
    const game = this.games.get(roomId);
    if (!game) return false;
    if (this.isGameFull(game)) throw new Error('Game is full');
    return true;
  }

  public refreshRoom(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (this.isUserInGames(client) === false)
      throw new Error('Client is not in this game');
    const game = this.getGameByPlayerId(client.id);
    if (!game) throw new Error('Game does not exist');
    return game.config;
  }

  public swapElementsInArray(
    array: Array<any>,
    indexA: number,
    indexB: number,
  ): void {
    const temp = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = temp;
  }

  public switchPosition(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (this.isUserInGames(client) === false)
      throw new Error('Client is not in this game');
    const game = this.getGameByPlayerId(client.id);
    if (!game) throw new Error('Game does not exist');
    if (game.config.nPlayers < 2)
      throw new Error('Not enough players to switch positions');
    const playerTeam = game.getPlayer(client.id)?.teamId;
    if (playerTeam === undefined)
      throw new Error('Player does not have a team');
    if (game.config.teams[playerTeam].players.length === 2) {
      this.swapElementsInArray(game.config.teams[playerTeam].players, 0, 1);
      game.setBackOrFront(playerTeam);
    } else throw new Error('Player does not have a teammate');
    return game.config;
  }

  // temporary code, needs to be rebuilt once we have the party lobby sending teamId
  public switchTeam(client: Socket): IGameConfig {
    if (!client) throw new Error('No client provided');
    if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
    
    const game = this.getGameByPlayerId(client.id); if (!game) throw new Error('Game does not exist');
    
    const player = game.getPlayer(client.id);
    if (!player) throw new Error('Player does not exist');

    const currTeam = player.teamId;
    const otherTeam = currTeam === 0 ? 1 : 0;

    if (game.config.teams[otherTeam]?.players.length === 2)
      throw new Error('Team is full');
    
    const index = game.getPlayerIndex(client.id);
    
    player.teamId = otherTeam;
    game.config.teams[otherTeam].players.push(player);
    if (index > -1) {
      game.config.teams[currTeam].players.splice(index, 1);
    } else {
      console.log('error deleting ' + client.id + ' from team');
      throw new Error('Error deleting player from team');
    }

    game.setBackOrFront(otherTeam);
    game.setBackOrFront(currTeam);
    return game.config;
  }

  public getGameByPlayerId(playerId: string): ServerGame | undefined {
    if (!playerId) return undefined;
    const game = Array.from(this.games.values()).find((game) =>
      game.getPlayer(playerId),
    );
    return game;
  }

  // RoomId is just a number and not game-<number>
  public getGameByRoomId(roomId: string): ServerGame | undefined {
    if (!roomId) return undefined;
    const game = this.games.get(roomId);
    return game;
  }

  public deleteGame(game: ServerGame): void {
    if (!game) throw new Error('No game provided');
    this.games.delete(game.roomId);
  }
}
