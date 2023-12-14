import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import PongModel from '@typings/models/pong';
import { Socket, Server } from 'socket.io';
import { PongService } from './pong.service';
import { AppService } from '@/app.service';
import { PongLobbyService } from '../ponglobbies/ponglobby.service';
import { UsersService } from '../users/users.service';
import { ClientSocket } from '@typings/ws';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';

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

  constructor(
    private usersService: UsersService,
    private authGuard: AuthGatewayGuard,
    private rootService: AppService,
    private service: PongService,
    private lobbyService: PongLobbyService,
  ) {}

  async handleConnection(
    @ConnectedSocket()
    client: ClientSocket,
  ): Promise<void> {
    console.log(`${client.data.user.nickname} connected`);
    try {
      if (!(await this.authGuard.canActivate(client)))
        return client.disconnect(true), void 0;

      const { user } = client.data;
      if (!user) return client.disconnect(true), void 0;

      const lobby = this.lobbyService.getLobbyByUser(user);
      if (!lobby) return client.disconnect(true), void 0;

      const game = lobby.game;
      if (!game) return client.disconnect(true), void 0;

      const player = game.getPlayerByUserId(user.id);
      if (!player) {
        const spectator = game.getSpectatorSocketByUserId(user.id);
        if (!spectator) {
          game.joinSpectators(client);
        }
      } else {
        game.joinPlayer(client, player);
        if (
          game.started === false &&
          game.nbConnectedPlayers === game.lobbyInterface.nPlayers
        ) {
          game.start();
        }
        game.room.emit(PongModel.Socket.Events.SetUIGame, {state: true, config: game.config});
      }
    } catch (error) {
      console.log(error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`${client.data.user.nickname} disconnected`);
    try {
      if (!(await this.authGuard.canActivate(client)))
        return client.disconnect(true), void 0;

      const { user } = client.data;
      if (!user) return client.disconnect(true), void 0;

      const lobby = this.lobbyService.getLobbyByUser(user);
      if (!lobby) return client.disconnect(true), void 0;

      const game = lobby.game;
      if (!game) return client.disconnect(true), void 0;

      const player = game.getPlayerByUserId(user.id);
      if (player) game.leavePlayer(client, player);
      else {
        const spectator = game.getSpectatorSocketByUserId(user.id);
        if (spectator) game.leaveSpectators(client);
      }
      game.room.emit(PongModel.Socket.Events.SetUIGame, {state: false, config: null});
      // emit msg to this person saying that he can set the uigame to null
    } catch (error) {
      console.log(error);
    }
  }

  afterInit() {
    console.log('PongGateway initialized');
    // @ts-expect-error impl
    this.service.server = this.server;
  }
}
