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
  private readonly testGame: ServerGame;
  private readonly games = new Map<string, ServerGame>();
  
  public pongSessionsId = 0;
  
  constructor() {}
  handleConnection(
    @ConnectedSocket()
    client: Socket,
  ): void {
    console.log('New connection');
  }

  afterInit() {
    // this.server.on('connection', (socket) => {
    //   socket.on('server-game-create', (data) => {
    //     const pongSession = new ServerGame(data, this.server);
    //     this.rooms.set(pongSession.id.toString(), pongSession);
    //   });
    //   socket.on('join-game', (data: { room: string }) => {
    //     if (!data.room) return;
    //     console.log('join-game', data);
    //     const room = this.rooms.get(data.room);
    //     if (!room) return;
    //     room.join(socket, data);
    //   });
    //   socket.on('game-readyState', (data: { room: string; state: boolean }) => {
    //     const room = this.rooms.get(data.room);
    //     if (!room) return;
    //     room.ready();
    //   });
    // });
    console.log('PongGateway initialized');
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('PongGateway disconnected');
  }

  @SubscribeMessage('server-game-create')
  createGame(client: Socket, data: any): void {
    console.log('server-game-create', data);
    const pongSession = new ServerGame(data, this.server, this.pongSessionsId++);
    this.games.set(pongSession.sessionId.toString(), pongSession);
    pongSession.join(client, data);
  }

  @SubscribeMessage('join-game')
  joinGame(client: Socket, data: any): void {
    console.log('join-game', data);
    const game = this.games.get(data.room);
    if (!game) return;
    game.join(client, data);
  }

  @SubscribeMessage('game-readyState')
  readyGame(client: Socket, data: any): void {
    const game = this.games.get(data.room);
    if (!game) return;
    game.ready();

    game.room.emit('movements');
  }

  // @SubscribeMessage('keyPress')
  // handleKeyPress(client: Socket, data: any): void {
  //   const room = this.rooms.get(data.room);
  //   if (!room) return;
  //   room.handleKeyPress(client, data);
  // }
}
