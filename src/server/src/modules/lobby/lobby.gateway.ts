import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ClientSocket } from '@typings/ws';
import { Server } from 'socket.io';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';
import { LobbyService } from './lobby.service';
import LobbyModel from '@typings/models/lobby';

@WebSocketGateway({
  namespace: 'api/lobby',
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class LobbyGateway
  implements
    OnGatewayInit<Server>,
    OnGatewayConnection<ClientSocket>,
    OnGatewayDisconnect<ClientSocket>
{
  constructor(
    private readonly authGuard: AuthGatewayGuard,
    private readonly service: LobbyService,
  ) {}
  async afterInit(server: Server) {
    await this.service.init(server);
  }
  async handleConnection(client: ClientSocket) {
    if (!(await this.authGuard.canActivate(client))) {
      client.disconnect(true);
      return;
    }
    await this.service.newConnection(client);
  }
  async handleDisconnect(client: ClientSocket) {
    await this.service.disconnect(client);
  }

  @SubscribeMessage('lobby:net:player:animation')
  async onPlayerAnimation(
    @ConnectedSocket() client: ClientSocket,
    @MessageBody('animation')
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
  ) {
    // console.log('lobby:net:player:animation', client.data.user.id, animation);
    await this.service.onPlayerAnimation(client, animation);
  }
  @SubscribeMessage('lobby:net:player:direction')
  async onPlayerDirection(
    @ConnectedSocket() client: ClientSocket,
    @MessageBody('transform')
    transform: Pick<LobbyModel.Models.ITransform, 'direction'>,
  ) {
    // console.log('lobby:net:player:direction', client.data.user.id, transform);
    this.service.onPlayerMove(client, transform.direction);
  }

  @SubscribeMessage('lobby:net:player:clothes')
  async onPlayerClothes(
    @ConnectedSocket() client: ClientSocket,
    @MessageBody()
    clothes: Record<LobbyModel.Models.InventoryCategory, number>,
  ) {
    // console.log('lobby:net:player:clothes', client.data.user.id, clothes);
    this.service.onPlayerClothes(client, clothes);
  }
}
