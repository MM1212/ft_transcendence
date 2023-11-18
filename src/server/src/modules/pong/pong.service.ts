import { Injectable } from '@nestjs/common';
import { ServerGame } from './game';
import { Server, Socket } from 'socket.io';
import { ETeamSide, IGameConfig, IPlayerConfig } from '@shared/Pong/config/configInterface';

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
  roomId: "",
  teams: [defaultLeftTeamConfig, defaultRightTeamConfig],
  partyOwnerId: "",
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

    private changeGameConfigOptions(socket: Socket, data: {game: IGameConfig, player: IPlayerConfig}, game: ServerGame)
    {        
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

    public createGame(data: {game: IGameConfig, player: IPlayerConfig}, server: Server, client: Socket): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!data.game || !data.player) throw new Error('No data provided');
        if (this.canCreateGame(client) === false) throw new Error('Client is already in a game');
        if (this.isUserInGames(client) === true) throw new Error('Client is already in a game');
        const game = new ServerGame(data.game, server, this.pongSessionsId++);
        this.games.set(game.sessionId.toString(), game);
        this.setPlayerConnectValues(client, data.player);
        this.changeGameConfigOptions(client, data, game);
        game.createGameSettings(client, {game: data.game, player: data.player});
        console.log(`${client.id} created and joined ${game.roomId}`);
        return game.config;
    }

    public joinGame(client: Socket, data: {roomId: string, player: IPlayerConfig}): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!data.roomId || !data.player) throw new Error('No data provided');
        if (this.canJoinGame(client, data.roomId) === false) throw new Error('Client cannot join this game');
        const game = this.games.get(data.roomId);
        if (!game) throw new Error('Game does not exist');
        this.setPlayerConnectValues(client, data.player);
        game.addPlayerToGame(client, data.player, undefined);
        console.log(`${client.id} joined ${game.roomId}`);
        return (game.config);
    }

    public readyToPlay(client: Socket, roomId: string): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!roomId) throw new Error('No data provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.games.get(roomId);
        if (!game) throw new Error('Game does not exist');
        game.playerReady(client.id);
        console.log(`socket ${client.id} clicked ready`);
        return game.config
    }

    // TODO
    public startGame(client: Socket, data: any): ServerGame {
        if (!client) throw new Error('No client provided');
        if (!data) throw new Error('No data provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is already in a game');
        const game = this.games.get(data.room);
        if (!game) throw new Error('Game does not exist');
        if (game.config.nPlayers < 2) throw new Error('Not enough players to start the game');
        return game;
    }

    public getAllGames(client: Socket): Array<string> {
        if (!client) throw new Error('No client provided');
        return Array.from(this.games.keys());
    }

    public finishedGame(client: Socket, data: any): void {
        if (!client) throw new Error('No client provided');
        if (!data) throw new Error('No data provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.games.get(data.room);
        if (!game) throw new Error('Game does not exist');
        // dunno about this one, might need add something here 
        this.leaveGame(client, data);
    }

    getAnotherRandomPlayer(game: ServerGame, player: IPlayerConfig): IPlayerConfig | undefined {
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
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.games.get(roomId);
        if (!game) throw new Error('Game does not exist');
        if (game.config.nPlayers === 0) throw new Error('Game is empty');
        const player = game.getPlayer(client.id);
        if (!player) throw new Error('Player does not exist');
        
        // this can't be like this. needs to receive the conf file from the new party owner
        if (player.userId === game.config.partyOwnerId) {
            if (game.config.nPlayers === 1) {
                game.removePlayerFromGame(client);
                game.config = defaultGameConfig;
                return game.config;
            } else {
                const otherPlayer = this.getAnotherRandomPlayer(game, player);
                if (otherPlayer) {

                    this.changeGameConfigOptions(client, {game: game.config, player: otherPlayer}, game);
                }
            }
        }
        
        const teamSide = player.teamId;

        // is this correct?
        //delete game.config.teams[player.teamId].players[player.positionOrder === 'front' ? 1 : 0];
        const teamPlayers = game.config.teams[player.teamId].players;
        const index = game.getPlayerIndex(client.id);
        if (index > -1) {
            teamPlayers.splice(index, 1);
        } else {
            console.log("error deleting " + client.id + " from team")
            throw new Error('Error deleting player from team');
        }
        game.removePlayerFromGame(client);
         // should this be done in server or in client? 
        game.setBackOrFront(teamSide);
        console.log(`${client.id} left ${game.roomId}`);
        return game.config;
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
        if (this.isUserInGames(client)) throw new Error('Client is already in a game');
        if (!this.doesGameExist(roomId)) throw new Error('Game does not exist');
        const game = this.games.get(roomId);
        if (!game) return false;
        if (this.isGameFull(game)) throw new Error('Game is full');
        return true;
    }

    public refreshRoom(client: Socket): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.getGameByPlayerId(client.id);
        if (!game) throw new Error('Game does not exist');
        return game.config;
    }

    public swapElementsInArray(array: Array<any>, indexA: number, indexB: number): void {
        const temp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = temp;
    }

    public switchPosition(client: Socket): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.getGameByPlayerId(client.id);
        if (!game) throw new Error('Game does not exist');
        if (game.config.nPlayers < 2) throw new Error('Not enough players to switch positions');
        const playerTeam = game.getPlayer(client.id)?.teamId;
        if (playerTeam === undefined) throw new Error('Player does not have a team');
        if (game.config.teams[playerTeam].players.length === 2) {
            this.swapElementsInArray(game.config.teams[playerTeam].players, 0, 1);
            game.setBackOrFront(playerTeam);
        }
        else throw new Error('Player does not have a teammate');
        return game.config;
    }

    public getGameByPlayerId(playerId: string): ServerGame | undefined {
        if (!playerId) return undefined;
        const game = Array.from(this.games.values()).find((game) => game.getPlayer(playerId));
        return game;
    }

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


