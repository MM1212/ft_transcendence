import { Lobby } from '@shared/Lobby/Lobby';
import { ServerCollision } from './Collision';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '@shared/Lobby/Events';
import { Server, Socket } from 'socket.io';
import { ServerPlayer } from './Player';
import User from '@/modules/users/user';
import LobbyModel from '@typings/models/lobby';
import Vector2D from '@shared/Vector/Vector2D';
import { LOBBY_STAGE_SIZE, LOBBY_TARGET_FPS } from '@shared/Lobby/constants';
import { Logger } from '@nestjs/common';
import { Character } from '@shared/Lobby/Character';
import { vector2 } from '@typings/vector';
import type Chat from '@/modules/chats/chat';
import ChatsModel from '@typings/models/chat';
import type { LobbyServices } from './Services';

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
  private tickHandle: NodeJS.Timeout | null = null;
  private readonly chat: Chat;
  constructor(
    public readonly sock: Server,
    private readonly services: LobbyServices,
  ) {
    super([], -1, new ServerCollision(), new ServerEvents(), ServerPlayer);
    this.tickHandle = setInterval(
      this.tick.bind(this),
      1000 / LOBBY_TARGET_FPS / 2,
    );
  }
  async onMount(): Promise<void> {
    await super.onMount();
    // @ts-expect-error impl
    this.chat = await this.services.chats.createTemporary({
      name: 'PongLobbyChat',
      type: ChatsModel.Models.ChatType.Temp,
      id: 'lobby-chat',
      authorization: ChatsModel.Models.ChatAccess.Public,
      authorizationData: {},
      participants: [],
      photo: '',
      topic: 'Lobby chat',
    }, undefined, false);
    this.logger.verbose(`Lobby chat created with id: ${this.chat.id}!`);
    this.chatId = this.chat.id;
  }
  public destructor(): Promise<void> {
    if (this.tickHandle) clearInterval(this.tickHandle);
    return super.destructor();
  }
  public broadcastSync(event: string, ...args: any[]): void {
    [...this.cons.values()].forEach((sock) => sock.emit(event, ...args));
  }
  public async broadcast(event: string, ...args: any[]): Promise<void> {
    await Promise.all(
      [...this.cons.values()].map((sock) => sock.emitWithAck(event, ...args)),
    );
  }
  public async broadcastTo(event: string, socks: Socket[], ...args: any[]) {
    await Promise.all(socks.map((sock) => sock.emitWithAck(event, ...args)));
  }
  public broadcastToSync(event: string, socks: Socket[], ...args: any[]) {
    socks.forEach((sock) => sock.emit(event, ...args));
  }

  public getConnectionsExcludingUsers(users: User[]): Socket[] {
    return [...this.cons.values()].filter(
      (sock) => !users.some((user) => user.id === sock.data.user.id),
    );
  }
  public getConnectionsExcept(sock: Socket): Socket[] {
    return [...this.cons.values()].filter((s) => s !== sock);
  }
  public async addPlayer(
    playerData: Pick<LobbyModel.Models.IPlayer, 'id' | 'name'>,
    characterData: LobbyModel.Models.ICharacter,
    transform?: LobbyModel.Models.ITransform,
    sock?: Socket,
  ): Promise<ServerPlayer> {
    const user = await this.services.users.get(playerData.id);
    if (!user) throw new Error(`User ${playerData.id} not found in db`);
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

    try {
      await this.services.chats.joinChat(this.chat.id, user);
      this.services.sse.emitTo<ChatsModel.Sse.NewChatEvent>(
        ChatsModel.Sse.Events.NewChat,
        user.id,
        { chatId: this.chat.id },
      );
      this.logger.verbose(`User ${user.id} added to lobby chat`);
    } catch (e) {
      this.logger.warn(`Failed to add user ${user.id} to lobby chat`);
    }
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
    const user = await this.services.users.get(playerHandle.id);
    if (!user) throw new Error(`User ${playerHandle.id} not found in db`);
    const ok = await super.removePlayer(player as any);
    if (!ok) return false;
    playerHandle.cons.forEach(this.cons.delete);
    await this.broadcast('player:leave', { id: playerHandle.id });
    try {
      await this.services.chats.leaveChat(this.chat.id, user, false);
      this.logger.verbose(`User ${user.id} removed from lobby chat`);
    } catch (e) {
      this.logger.warn(`Failed to remove user ${user.id} from lobby chat`);
    }
    return ok;
  }

  private lastTick = performance.now();
  private readonly targetDelta = 1000 / LOBBY_TARGET_FPS;
  private tick(): void {
    const delta = performance.now() - this.lastTick;
    this.lastTick = performance.now();
    const deltaFromTarget = delta / this.targetDelta;
    this.onUpdate(deltaFromTarget);
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
      const CHARACTER_DATA: LobbyModel.Models.ICharacter = {
        clothes: user.character.clothes,
        animation: 'idle/down',
      };
      await this.addPlayer(
        { id: user.id, name: user.nickname },
        CHARACTER_DATA,
        {
          position: LOBBY_STAGE_SIZE.divide(2).subtract(300, 0),
          direction: Vector2D.Zero,
          speed: 0,
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

  public async onNetPlayerAnimation(
    sock: Socket,
    user: User,
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
  ) {
    const player = this.getPlayer(user);
    if (!player) return;
    await player.character.playAnimation(animation);
    this.broadcastToSync('player:animation', this.getConnectionsExcept(sock), {
      id: player.id,
      animation,
    });
  }
  public onNetPlayerMove(sock: Socket, user: User, _direction: vector2) {
    const player = this.getPlayer(user);
    if (!player) return;
    const direction = new Vector2D(_direction);
    if (player.transform.direction.equals(direction)) return;
    player.transform.direction = direction;
    if (player.transform.direction.length() !== 0) player.transform.speed = 3.5;
    else player.transform.speed = 0;
    this.broadcastToSync('player:move', this.getConnectionsExcept(sock), {
      id: player.id,
      transform: player.transform.toObject(),
    });
  }

  public async onNetPlayerClothes(
    sock: Socket,
    user: User,
    changed: Record<LobbyModel.Models.InventoryCategory, number>,
  ) {
    const player = this.getPlayer(user);
    if (!player) return;
    await user.character.updateClothes(changed);
    await player.character.setClothes({
      ...player.character.clothes,
      ...changed,
    });
    this.broadcastToSync('player:clothes', this.getConnectionsExcept(sock), {
      id: player.id,
      changed,
    });
  }
}
