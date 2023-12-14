import { Game } from '@shared/Pong/Game';
import { WINDOWSIZE_X, WINDOWSIZE_Y } from '@shared/Pong/main';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events';
import { BroadcastOperator } from 'socket.io';
import PongModel from '@typings/models/pong';
import { ClientSocket } from '@typings/ws';

type Room = BroadcastOperator<DefaultEventsMap, any>;

export class ServerGame extends Game {
  public UUID: string;

  private updateHandle: NodeJS.Timeout | undefined;
  public readonly room: Room;
  
  public nbConnectedPlayers = 0;
  public started = false;
  
  public spectators: Map<number, ClientSocket> = new Map(); // userId, socket
  
  // interface can be removed, need to setup one that will
  //  return the results of the game 

  constructor(
    public lobbyInterface: PongModel.Models.ILobby,
    public config: PongModel.Models.IGameConfig,
    public server: Server,
  ) {
    super(WINDOWSIZE_X, WINDOWSIZE_Y);

    this.UUID = config.UUID;
    this.room = server.to(this.UUID);
    console.log(`Room ${this.UUID}: created`);
  }

  public joinPlayer(client: ClientSocket, player: PongModel.Models.IPlayerConfig): void {
    client.join(this.UUID);
    player.connected = true;
    this.nbConnectedPlayers++;
    console.log(`> Player ${player.nickname} joined room ${this.UUID} <`);
    this.room.emit(PongModel.Socket.Events.UpdateConnectedPlayers, this.getConnectedPlayers());
  }

  public leavePlayer(client: ClientSocket, player: PongModel.Models.IPlayerConfig): void {
    client.leave(this.UUID);
    player.connected = false;
    this.nbConnectedPlayers--;
    console.log(`> Player ${player.nickname} left room ${this.UUID} <`);
    this.room.emit(PongModel.Socket.Events.UpdateConnectedPlayers, this.getConnectedPlayers());
  }

  public joinSpectators(client: ClientSocket): void {
    this.spectators.set(client.data.user.id, client);
    client.join(this.UUID);
    console.log(`> Spectator joined room ${this.UUID} <`);
  }

  public leaveSpectators(client: ClientSocket): void {
    this.spectators.delete(client.data.user.id);
    client.leave(this.UUID);
    console.log(`> Spectator left room ${this.UUID} <`);
  }

  public getPlayerByUserId(userId: number): PongModel.Models.IPlayerConfig | null {
    for (const team of this.config.teams) {
      for (const player of team.players) {
        if (player.userId === userId) return player;
      }
    }
    return null;
  }

  public getSpectatorSocketByUserId(userId: number): ClientSocket | null {
    return this.spectators.get(userId) || null;
  }

  public getConnectedPlayers(): PongModel.Models.IPlayerConfig[] {
    const connectedPlayers = [];
    for (const team of this.config.teams) {
      for (const player of team.players) {
        if (player.connected) connectedPlayers.push(player);
      }
    }
    return connectedPlayers;
  }
}
