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
import { IGameConfig, IPlayerConfig } from '@shared/Pong/config/configInterface';

// TEMPORARY FOR THE LEAVE ROOM FUNCTION
enum ETeamSide {
  Left,
  Right,
}

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

@WebSocketGateway({
  namespace: 'api/pong',
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
  
  @SubscribeMessage('create-room')
  createGame(client: Socket, data: {game: IGameConfig, player: IPlayerConfig}): void {
    try {
      const gameConf = this.service.createGame(data, this.server, client);
      client.emit('create-room', "", gameConf);
    } catch (error) {
      this.errorHandler('create-room', client, error.message);
    }
  }

  @SubscribeMessage('join-room')
  joinGame(client: Socket, data: {roomId: string, player: IPlayerConfig}): void {
    try {
      const gameConf = this.service.joinGame(client, data);
      client.emit('join-room', "", gameConf);
    } catch (error) {
      this.errorHandler('join-room', client, error.message);
    }
  }

  @SubscribeMessage('ready-player')
  readyToPlay(client: Socket, roomId: string): void {
    try {
      const gameConf = this.service.readyToPlay(client, roomId);
      client.emit('ready-player', "", gameConf);
    } catch (error) {
      this.errorHandler('ready-player', client, error.message);
    }
  }

  // TODO
  @SubscribeMessage('start-game')
  startGame(client: Socket, data: any): void {
    try {
      const game = this.service.startGame(client, data);
      // game.start for all players in room
    } 
    catch (error) {
      this.errorHandler('start-game', client, error.message);
    }
  }

  @SubscribeMessage('get-rooms')
  getAvailableRooms(client: Socket): void {
    try {
      const gamesKeys = this.service.getAllGames(client);
      client.emit("get-rooms", "", (gamesKeys));
    } catch (error) {
      this.errorHandler("get-rooms", client, error.message);
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

  @SubscribeMessage('leave-room')
  leaveGame(client: Socket, roomId: string): void {
    try {
      const gameConf = this.service.leaveGame(client, roomId);
      // dont know if i need to send config to client
      // wait for reconnect or something
      if (gameConf.nPlayers === 0) {
        const room = this.service.getGameByRoomId(roomId);
        if (room)
        {
          this.service.deleteGame(room);
          console.log(`Deleting room ${roomId}`);
        }
      }
      client.emit('leave-room', "", defaultGameConfig);
    } catch (error) {
      this.errorHandler('leave-room', client, error.message);
    }
  }

  @SubscribeMessage('refresh-room')
  refreshRoom(client: Socket): void {
    try {
      const gameConf = this.service.refreshRoom(client);
      client.emit('refresh-room', "", gameConf);
    } catch (error) {
      this.errorHandler('refresh-room', client, error.message);
    }
  }

  @SubscribeMessage('switch-position')
  switchPosition(client: Socket, data: string): void {
    try {
      const gameConf = this.service.switchPosition(client);
      client.emit('switch-position', "", gameConf);
    } catch (error) {
      this.errorHandler('switch-position', client, error.message);
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
