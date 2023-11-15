import { Injectable } from '@nestjs/common';
import { ServerGame } from './game';
import { Server, Socket } from 'socket.io';
import { throwError } from 'rxjs';
import { IGameConfig } from '@shared/Pong/config/configInterface';

@Injectable()
export class PongService {
    private games = new Map<string, ServerGame>();
    private pongSessionsId = 1; // has to start with 1 because of the first room created being 0 

    // add sse event dependency
    constructor() {}

    public createGame(data: IGameConfig, server: Server, client: Socket): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!data) throw new Error('No data provided');
        if (this.canCreateGame(client) === false) throw new Error('Client is already in a game');
        if (this.isUserInGames(client) === true) throw new Error('Client is already in a game');
        const game = new ServerGame(data, server, this.pongSessionsId++);
        this.games.set(game.sessionId.toString(), game);
        console.log(`${client.id} created ${game.roomId}`);
        game.config.roomId = game.roomId;
        // update data (defaultGameConfig)
        game.join(client);
        console.log(`${client.id} joined ${game.roomId}`);
        return data;
    }

    public joinGame(client: Socket, roomId: string): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!roomId) throw new Error('No data provided');
        if (this.canJoinGame(client, roomId) === false) throw new Error('Client cannot join this game');
        const game = this.games.get(roomId);
        if (!game) throw new Error('Game does not exist');
        game.join(client);
        console.log(`${client.id} joined ${game.roomId}`);
        return (game.config);
    }

    public readyToPlay(client: Socket, roomId: string): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!roomId) throw new Error('No data provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.games.get(roomId);
        // get the player through the userId
        // update player ready status to (!data.teams.players[0|1].ready)
        if (!game) throw new Error('Game does not exist');
        console.log(`socket ${client.id} is ready to play`);
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
    
    public leaveGame(client: Socket, roomId: string): IGameConfig {
        if (!client) throw new Error('No client provided');
        if (!roomId) throw new Error('No room provided');
        if (this.isUserInGames(client) === false) throw new Error('Client is not in this game');
        const game = this.games.get(roomId);
        if (!game) throw new Error('Game does not exist');
        console.log(`${client.id} left ${game.roomId}`);
        // i dunno if what's below can be here
        game.leave(client);
        if (game.config.nPlayers === 0) {
            this.games.delete(roomId);
            console.log(`Game ${game.roomId} deleted`);
        }
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
}
