import { Injectable } from '@nestjs/common';
import { ServerLobby } from './src/Lobby';
import { Server } from 'socket.io';
import { ClientSocket } from '@typings/ws';
import { vector2 } from '@typings/vector';
import LobbyModel from '@typings/models/lobby';

@Injectable()
export class LobbyService {
  public readonly instance: ServerLobby;
  constructor() {}

  public async init(sock: Server) {
    // @ts-expect-error impl
    this.instance = new ServerLobby(sock);
    await this.instance.onMount()
  }

  async newConnection(client: ClientSocket) {
    await this.instance.onUserConnection(client.data.user, client);
  }
  async disconnect(client: ClientSocket) {
    await this.instance.onUserDisconnection(client.data.user, client);
  }

  async onPlayerAnimation(
    client: ClientSocket,
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
  ) {
    await this.instance.onNetPlayerAnimation(
      client,
      client.data.user,
      animation,
    );
  }

  async onPlayerClothes(
    client: ClientSocket,
    clothes: Record<LobbyModel.Models.InventoryCategory, number>,
  ) {
    await this.instance.onNetPlayerClothes(client, client.data.user, clothes);
  }

  onPlayerMove(client: ClientSocket, direction: vector2) {
    this.instance.onNetPlayerMove(client, client.data.user, direction);
  }
}
