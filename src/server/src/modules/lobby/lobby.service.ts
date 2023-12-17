import { Injectable } from '@nestjs/common';
import { ServerLobby } from './src/Lobby';
import { Server } from 'socket.io';
import { ClientSocket } from '@typings/ws';

@Injectable()
export class LobbyService {
  public readonly instance: ServerLobby;
  constructor() {}

  public init(sock: Server) {
    // @ts-expect-error impl
    this.instance = new ServerLobby(sock);
  }

  async newConnection(client: ClientSocket) {
    await this.instance.onUserConnection(client.data.user, client);
  }
  async disconnect(client: ClientSocket) {
    await this.instance.onUserDisconnection(client.data.user, client);
  }
}
