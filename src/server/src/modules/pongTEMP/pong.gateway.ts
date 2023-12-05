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

  // Add checks for isSpectating a game or not
  // Add leave spectators
  // Spectator can be the party owner
  
  
  @SubscribeMessage('create-room')
  createGame(client: Socket, data: {game: IGameConfig, player: IPlayerConfig}): void {
    try {
      const gameConf = this.service.createGame(data, this.server, client);
      client.emit('create-room', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes', gameConf);
    } catch (error) {
      this.errorHandler('create-room', client, error.message);
    }
  }

  @SubscribeMessage('join-room')
  joinGame(client: Socket, data: {roomId: string, player: IPlayerConfig}): void {
    try {
      const gameConf = this.service.joinGame(client, data);
      client.emit('join-room', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes', gameConf);
    } catch (error) {
      this.errorHandler('join-room', client, error.message);
    }
  }

  @SubscribeMessage('ready-player')
  readyToPlay(client: Socket): void {
    try {
      const gameConf = this.service.readyToPlay(client);
      client.emit('ready-player', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
    } catch (error) {
      this.errorHandler('ready-player', client, error.message);
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

  @SubscribeMessage('leave-room')
  leaveGame(client: Socket, roomId: string): void {
    try {
      const gameConf = this.service.leaveGame(client, roomId);
      // dont know if i need to send config to client
      // wait for reconnect or something
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
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

  @SubscribeMessage('switch-position')
  switchPosition(client: Socket, data: string): void {
    try {
      const gameConf = this.service.switchPosition(client);
      client.emit('switch-position', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
    } catch (error) {
      this.errorHandler('switch-position', client, error.message);
    }
  }

  @SubscribeMessage('switch-team')
  switchTeam(client: Socket, data: string): void {
    try {
      //data should be the team id, because we can switch to the other 
      //  team normally, but if we are spectator we can switch to both
      //or shall it exist a general switch-team button and a join team-if-spectator?
      const gameConf = this.service.switchTeam(client);
      client.emit('switch-team', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
    } catch (error) {
      this.errorHandler('switch-team', client, error.message);
    }
  }

  // missing tests with spectators
  @SubscribeMessage('switch-party-owner')
  switchPartyOwner(client: Socket, newOwnerId: string): void {
    try {
      const gameConf = this.service.switchPartyOwner(client, newOwnerId);
      client.emit('switch-party-owner', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
    } catch (error) {
      this.errorHandler('switch-party-owner', client, error.message);
    }
  }

  @SubscribeMessage('join-spectator')
  joinSpectator(client: Socket, roomId: string): void {
    try {
      const gameConf = this.service.joinSpectator(client);
      client.emit('join-spectator', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
    } catch (error) {
      this.errorHandler('join-spectator', client, error.message);
    }
  }

  @SubscribeMessage('join-team')
  joinTeam(client: Socket): void {
    try {
      const gameConf = this.service.joinTeam(client);
      client.emit('join-team', "", gameConf);
      this.server.to(gameConf.roomId).emit('update-config-changes',  gameConf);
    } catch (error) {
      this.errorHandler('join-team', client, error.message);
    }
  }

  @SubscribeMessage('start-game')
  startGame(client: Socket, roomId: string | undefined): void {
    try {
      if (!roomId)
      {
        const gameConf = this.service.startGame(client);
        this.server.to(gameConf.roomId).emit('STARTGAME', gameConf);
      } else {
        console.log(`Starting game ${roomId}`);
        // temp
        const game = this.service.getGameByRoomId(roomId.replace("game-", ""));
        if (!game) throw new Error(`Game ${roomId} not found`);
        this.server.to(roomId).emit('STARTMOVING');
        game?.start();
      }
    } catch (error) {
      this.errorHandler('start-game', client, error.message);
    }
  }

  private errorHandler(eventMsg: string, client: Socket, message: string): void {
    client.emit(eventMsg, message, undefined);
    console.log(message);
  }

  @SubscribeMessage('keyPress')
  handleKeyPress(client: Socket, data: {key: string, state: boolean}): void {
    console.log(data.key)
    this.service.handleKeys(client, data);
  }
}

