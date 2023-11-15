import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerGame } from './game';
import { Player } from '@shared/Pong/Paddles/Player';
import { PongService } from './pong.service';
import { IGameConfig } from '@shared/Pong/config/configInterface';

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class PongGateway
  implements
    OnGatewayInit<Server>,
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>
{
  @WebSocketServer()
  private readonly server: Server;
  
  constructor(private service: PongService) {}
  handleConnection(
    @ConnectedSocket()
    client: Socket,
  ): void {
    console.log('New connection');
  }

  afterInit() {
    console.log('PongGateway initialized');
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('PongGateway disconnected');
  }
  
  @SubscribeMessage('create-game')
  createGame(client: Socket, data: IGameConfig): void {
    try {
      const gameConf = this.service.createGame(data, this.server, client);
      client.emit('join-room', "", gameConf);
    } catch (error) {
      this.errorHandler('join-room', client, error.message);
    }
  }

  @SubscribeMessage('join-game')
  joinGame(client: Socket, roomId: string): void {
    try {
      const gameConf = this.service.joinGame(client, roomId);
      client.emit('join-room', "", gameConf);
    } catch (error) {
      this.errorHandler('join-room', client, error.message);
    }
  }

  @SubscribeMessage('ready-player')
  readyToPlay(client: Socket, roomId: string): void {
    try {
      this.service.readyToPlay(client, roomId);
      client.emit('ready-change', "", roomId);
    } catch (error) {
      this.errorHandler('ready-change', client, error.message);
    }
  }
  
  // TODO
  @SubscribeMessage('game-start')
  startGame(client: Socket, data: any): void {
    try {
      const game = this.service.startGame(client, data);
      // game.start for all players in room
    } 
    catch (error) {
      this.errorHandler("", client, error.message);
    }
  }

  @SubscribeMessage('get-rooms')
  getAvailableRooms(client: Socket): void {
    try {
      const gamesKeys = this.service.getAllGames(client);
      client.emit("all-rooms", "", (gamesKeys));
    } catch (error) {
      this.errorHandler("all-rooms", client, error.message);
    }
  }

  @SubscribeMessage('game-finished')
  finishedGame(client: Socket, data: any): void {
    try {
      this.service.finishedGame(client, data);
      // Hmmm i dunno about this one
    } catch (error) {
      this.errorHandler("", client, error.message);
    }
  }

  @SubscribeMessage('leave-game')
  leaveGame(client: Socket, roomId: string): void {
    try {
    console.log(roomId);
      const gameConf = this.service.leaveGame(client, roomId);
      // dont know if i need to send config to client
      client.emit('leave-room', "", gameConf);
      // wait for reconnect or something
    } catch (error) {
      this.errorHandler('leave-room', client, error.message);
    }
  }

  private errorHandler(eventMsg: string, client: Socket, message: string): void {
    client.emit(eventMsg, message, undefined);
    console.log(message);
  }

  // @SubscribeMessage('keyPress')
  // handleKeyPress(client: Socket, data: any): void {
  //   const room = this.rooms.get(data.room);
  //   if (!room) return;
  //   room.handleKeyPress(client, data);
  // }
}
