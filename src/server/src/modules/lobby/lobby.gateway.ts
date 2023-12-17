import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ClientSocket } from '@typings/ws';
import { Server } from 'socket.io';
import { AuthGatewayGuard } from '../auth/guards/auth-gateway.guard';
import { LobbyService } from './lobby.service';

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
  afterInit(server: Server) {
    this.service.init(server);
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
}
