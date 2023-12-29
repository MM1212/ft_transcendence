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
import { UsersService } from '../users/services/users.service';
import { ClientSocket } from '@typings/ws';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';
import { ServerGame } from './pong';
import User from '../users/user';

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

  @SubscribeMessage(PongModel.Socket.Events.KeyPress)
  handleKeyPress(client: Socket, data: { key: string; state: boolean }): void {
    this.service.handleKeys(client, data);
  }
  
  @SubscribeMessage(PongModel.Socket.Events.UpdateDisconnected)
  handleUpdateDisconnected(client: Socket, data: { roomId: string }): void {
    this.service.handleUpdateDisconnected(client, data.roomId);
  }

  async handleConnection(
    @ConnectedSocket()
    client: ClientSocket,
  ): Promise<void> {
    try {
      const { user, game } = (await this.getGameOfClient(client)) || {};
      if (!user || !game) return client.disconnect(true), void 0;

      const player = game.getPlayerByUserId(user.id);
      if (!player) {
        const spectator = game.getSpectatorSocketByUserId(user.id);
        if (!spectator) {
          game.joinSpectators(client);
        }
      } else {
        if (
          player.connected === true &&
          game.userIdToSocketId.get(user.id) !== client.id
        ) {
          client.emit(PongModel.Socket.Events.AlreadyConnected);
          return client.disconnect(true), void 0;
        }
        if (game.run === true) {
          game.room.emit(PongModel.Socket.Events.Reconnected, {
            tag: player.tag,
            nickname: player.nickname,
          });
        }
        game.joinPlayer(client, player);
        this.service.clientInGames.set(user.id, game.UUID);
        console.log(`${client.data.user.nickname} connected`);
        client.emit(PongModel.Socket.Events.SetUI, {
          state: true,
          config: game.config,
        });
        if (game.run === true) game.emitUpdateGame(client);
        game.checkStart();
      }
    } catch (error) {
      console.log(error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const { user, game } = (await this.getGameOfClient(client)) || {};
      if (!user || !game) return client.disconnect(true), void 0;

      const player = game.getPlayerByUserId(user.id);
      if (player)
      {
        if (game.userIdToSocketId.get(user.id) === client.id) {
          game.leavePlayer(client, player);
        } else {
          return client.disconnect(true), void 0;
        }
      } else {
        const spectator = game.getSpectatorSocketByUserId(user.id);
        if (spectator) game.leaveSpectators(client);
      }
      if (game.run === true && player !== null) {
        game.room.emit(PongModel.Socket.Events.Disconnected, {
          tag: player.tag,
          nickname: player.nickname,
        });
      }
      this.service.clientInGames.delete(user.id);
      console.log(`${client.data.user.nickname} disconnected`);
      client.emit(PongModel.Socket.Events.SetUI, {
        state: false,
        config: null,
      });
    } catch (error) {
      console.log(error);
    }
  }

  private async getGameOfClient(
    client: ClientSocket,
  ): Promise<{ user: User; game: ServerGame } | null> {
    if (!(await this.authGuard.canActivate(client))) return null;

    const { user } = client.data;
    if (!user) return null;

    const lobby = this.lobbyService.getLobbyByUser(user);
    if (!lobby) return null;

    const game = lobby.game;
    if (!game) return null;

    return { user, game };
  }

  afterInit() {
    console.log('PongGateway initialized');
    // @ts-expect-error impl
    this.service.server = this.server;
  }
}
