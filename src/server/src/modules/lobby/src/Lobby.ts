import { Lobby } from '@shared/Lobby/Lobby';
import { ServerCollision } from './Collision';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '@shared/Lobby/Events';
import { Server, Socket } from 'socket.io';
import { ServerPlayer } from './Player';
import User from '@/modules/users/user';
import LobbyModel from '@typings/models/lobby';
import Vector2D from '@shared/Vector/Vector2D';
import { LOBBY_STAGE_SIZE } from '@shared/Lobby/constants';
import { Logger } from '@nestjs/common';
import { Character } from '@shared/Lobby/Character';

class ServerEvents extends Events {
  protected readonly emitter: EventEmitter2 = new EventEmitter2({
    wildcard: true,
  });
  constructor() {
    super();
  }
}

export class ServerLobby extends Lobby {
  public cons: Set<Socket> = new Set();
  private readonly logger = new Logger(ServerLobby.name);
  constructor(public readonly sock: Server) {
    super([], -1, new ServerCollision(), new ServerEvents(), ServerPlayer);
  }

  public async broadcast(event: string, ...args: any[]): Promise<void> {
    await Promise.all(
      [...this.cons.values()].map((sock) => sock.emitWithAck(event, ...args)),
    );
  }
  public async addPlayer(
    playerData: Pick<LobbyModel.Models.IPlayer, 'id' | 'name'>,
    characterData: LobbyModel.Models.ICharacter,
    transform?: LobbyModel.Models.ITransform,
    sock?: Socket,
  ): Promise<ServerPlayer> {
    const player = await super.addPlayer(
      playerData,
      characterData,
      transform,
      Character,
      sock,
    );
    this.logger.verbose('Sending player:join event to lobby..');
    await this.broadcast('player:join', player.public);
    if (sock) this.cons.add(sock);
    return player as ServerPlayer;
  }
  public getPlayer(playerId: number): ServerPlayer | undefined;
  public getPlayer(playerName: string): ServerPlayer | undefined;
  public getPlayer(user: User): ServerPlayer | undefined;
  public getPlayer(player: number | string | User): ServerPlayer | undefined {
    if (player instanceof User) {
      return super.getPlayer(player.id) as ServerPlayer | undefined;
    }
    return super.getPlayer(player as any) as ServerPlayer | undefined;
  }

  public async removePlayer(playerId: number): Promise<boolean>;
  public async removePlayer(playerName: string): Promise<boolean>;
  public async removePlayer(player: ServerPlayer): Promise<boolean>;
  public async removePlayer(
    player: number | string | ServerPlayer,
  ): Promise<boolean> {
    const playerHandle =
      player instanceof ServerPlayer ? player : this.getPlayer(player as any);
    if (!playerHandle) throw new Error(`Player ${player} not found in lobby`);
    const ok = await super.removePlayer(player as any);
    if (!ok) return false;
    playerHandle.cons.forEach(this.cons.delete);
    await this.broadcast('player:leave', { id: playerHandle.id });
    return ok;
  }

  // handling service
  public async onUserConnection(user: User, sock: Socket): Promise<void> {
    const player = this.getPlayer(user);
    this.logger.verbose(`User ${user.id} connecting to lobby..`);
    if (player) {
      await player.addConnection(sock);
      this.cons.add(sock);
      this.logger.verbose('Player already exists in lobby, added connection!');
    } else {
      // TODO: fetch char data from db
      const CHARACTER_DATA: LobbyModel.Models.ICharacter = {
        clothes: {
          color: 2,
          body: -1,
          feet: -1,
          head: -1,
          hand: -1,
          neck: -1,
          face: -1,
        },
        animation: 'idle/down',
      };
      await this.addPlayer(
        { id: user.id, name: user.nickname },
        CHARACTER_DATA,
        {
          position: LOBBY_STAGE_SIZE.divide(2).subtract(300, 0),
          direction: Vector2D.Zero,
          speed: 4,
        },
        sock,
      );
      this.logger.verbose('Player added to lobby!');
    }
  }

  public async onUserDisconnection(user: User, sock: Socket): Promise<void> {
    const player = this.getPlayer(user);
    if (!player) return;
    this.logger.verbose(`User ${user.id} con disconnecting from lobby..`);
    await player.removeConnection(sock);
    this.cons.delete(sock);
    if (player.cons.length > 0) return;
    await this.removePlayer(player);
    this.logger.warn(`Player ${player.id} removed from lobby!`);
  }
}
