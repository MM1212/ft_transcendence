import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class PongGateway implements
OnGatewayInit<Server>,
OnGatewayConnection<Socket>,
OnGatewayDisconnect<Socket>{

    constructor() {
    }
    handleConnection(
      @ConnectedSocket()
      client: Socket,
    ): void {console.log("New connection");}

    afterInit() {
      console.log('PongGateway initialized');
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
      console.log('PongGateway disconnected');
    }

}
