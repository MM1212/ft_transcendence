import { AppService } from '@/app.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Lobbies } from '@typings/lobby';
import { IPenguinBaseAnimationsTypes } from '@typings/penguin';
import LobbyModel from '@typings/models/lobby';
import Vector2D from '@shared/Vector/Vector2D';
import fs from 'fs';
import { PNG } from 'pngjs';
import { Logger } from '@nestjs/common';

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
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>,
    Lobbies.ILobby
{
  @WebSocketServer()
  private readonly server: Server;
  readonly players: Lobbies.IPlayer[] = [];
  private readonly walkableAreaMaskBuffer: PNG;
  private readonly logger = new Logger(LobbyGateway.name);

  constructor(private readonly rootService: AppService) {
    const stream = fs.createReadStream('dist/assets/lobby/mask.png');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    stream.pipe(new PNG()).on('parsed', function () {
      // @ts-expect-error - pngjs typings are wrong
      instance.walkableAreaMaskBuffer = this;
    });
  }
  getPixelColor(x: number, y: number): number {
    const address = (this.walkableAreaMaskBuffer.width * y + x) << 2;
    const r = this.walkableAreaMaskBuffer.data[address];
    const g = this.walkableAreaMaskBuffer.data[address + 1];
    const b = this.walkableAreaMaskBuffer.data[address + 2];
    const a = this.walkableAreaMaskBuffer.data[address + 3];
    return (r << 24) | (g << 16) | (b << 8) | a;
  }
  validateNewPlayerPosition(position: Vector2D): boolean {
    const pixel = this.getPixelColor(
      Math.floor(position.x),
      Math.floor(position.y),
    );
    const a = pixel & 0xff;
    return a !== 0;
  }
  afterInit() {
    setInterval(() => this.onTick(), 1000 / 60);
  }
  handleConnection(
    @ConnectedSocket()
    client: Socket,
  ): void {
    if (!client.handshake.headers.cookie)
      return client.disconnect(true), void 0;
    // parse session cookie
    // get user from session
    const app = this.rootService.app.getHttpAdapter().getInstance();
    const sessionId = app.parseCookie(client.handshake.headers.cookie).session;
    const session = app.decodeSecureSession(sessionId);
    if (!session || !session.get('user'))
      return client.disconnect(true), void 0;
    const user = session.get('user')!;
    if (!user.loggedIn) return client.disconnect(true), void 0;
    const playerRef = this.players.find((player) => player.userId === user.id);
    if (playerRef) {
      playerRef.connections.push(client);
      this.logger.verbose(
        `LobbyGatewa new client connection ${user.nickname}${user.id}, at ${playerRef.connections.length} connections.`,
      );
    } else {
      this.players.push({
        userId: user.id,
        transform: {
          position: {
            x: LobbyModel.Models.STAGE_WIDTH / 2 - 300,
            y: LobbyModel.Models.STAGE_HEIGHT / 2,
          },
          direction: { x: 0, y: 0 },
          speed: 4,
        },
        currentAnimation: 'idle/down',
        connections: [client],
      });
      this.logger.verbose(
        `LobbyGateway client connected ${user.nickname} ${user.id}`,
      );
    }
    client.emit(Lobbies.Packets.Events.LoadData, {
      players: this.players.map((player) => ({ ...player, connections: [] })),
    } as Lobbies.Packets.LoadData);
    if (playerRef) return;
    const player = this.players.find((player) => player.userId === user.id);
    this.players.forEach((p) => {
      if (p.userId === user.id) return;
      p.connections.forEach((con: Socket) => {
        con.emit(Lobbies.Packets.Events.NewPlayer, {
          player: { ...player, connections: [] },
        } as Lobbies.Packets.NewPlayer);
      });
    });
  }
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const playerRef = this.players.find((player) =>
      player.connections.find((con: Socket) => con.id === client.id),
    );
    if (!playerRef) return;
    playerRef.connections = playerRef.connections.filter(
      (con: Socket) => con.id !== client.id,
    );
    if (playerRef.connections.length === 0) {
      this.players.splice(this.players.indexOf(playerRef), 1);
      this.players.forEach((player) => {
        player.connections.forEach((con: Socket) => {
          con.emit(Lobbies.Packets.Events.RemovePlayer, {
            id: playerRef.userId,
          } as Lobbies.Packets.RemovePlayer);
        });
      });
    }
    this.logger.log('LobbyGateway client disconnected');
  }

  @SubscribeMessage('update-velocity')
  updatePlayerVelocity(
    @MessageBody()
    {
      key,
      pressed,
      anim,
    }: {
      key: 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD';
      pressed: boolean;
      anim: IPenguinBaseAnimationsTypes;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.handshake.headers.cookie)
      return client.disconnect(true), void 0;
    // parse session cookie
    // get user from session
    const app = this.rootService.app.getHttpAdapter().getInstance();
    const sessionId = app.parseCookie(client.handshake.headers.cookie).session;
    const session = app.decodeSecureSession(sessionId);
    if (!session || !session.get('user'))
      return client.disconnect(true), void 0;
    const user = session.get('user')!;
    if (!user.loggedIn) return client.disconnect(true), void 0;
    const playerRef = this.players.find((player) => player.userId === user.id);
    if (!playerRef) return client.disconnect(true), void 0;
    switch (key) {
      case 'KeyA':
        playerRef.transform.direction.x = pressed ? -1 : 0;
        break;
      case 'KeyD':
        playerRef.transform.direction.x = pressed ? 1 : 0;
        break;
      case 'KeyW':
        playerRef.transform.direction.y = pressed ? -1 : 0;
        break;
      case 'KeyS':
        playerRef.transform.direction.y = pressed ? 1 : 0;
        break;
    }
    playerRef.currentAnimation = anim;
    this.players.forEach((player) => {
      player.connections.forEach((con: Socket) => {
        con.emit(Lobbies.Packets.Events.UpdatePlayersTransform, {
          players: [
            {
              id: playerRef.userId,
              direction: playerRef.transform.direction,
              newAnim: playerRef.currentAnimation,
            },
          ],
        } as Lobbies.Packets.UpdatePlayersTransform);
      });
    });
  }
  private lastTick = Date.now();
  private moved = new Map<number, boolean>();
  onTick() {
    this.players.forEach((player) => {
      if (
        player.transform.direction.x === 0 &&
        player.transform.direction.y === 0
      )
        return;
      const velocity = new Vector2D(player.transform.direction)
        .normalize()
        .multiply(player.transform.speed);
      const newPosition = new Vector2D(player.transform.position).add(velocity);
      if (
        !this.validateNewPlayerPosition(newPosition) ||
        newPosition.x < 0 ||
        newPosition.x > LobbyModel.Models.STAGE_WIDTH ||
        newPosition.y < 0 ||
        newPosition.y > LobbyModel.Models.STAGE_HEIGHT
      ) {
        return;
      }
      player.transform.position = newPosition.toObject();
      this.moved.set(player.userId, true);
    });
    // if (Date.now() - this.lastTick > 1000 / 30) {
    const payload: Lobbies.Packets.UpdatePlayersTransform = {
      players: this.players
        .map((player) => ({
          id: player.userId,
          ...player.transform,
        }))
        .filter((player) => !!this.moved.get(player.id)),
    };
    this.moved.clear();
    if (payload.players.length > 0) {
      this.players.forEach((player) => {
        player.connections.forEach((con: Socket) => {
          con.emit(Lobbies.Packets.Events.UpdatePlayersTransform, payload);
        });
      });
    }
    this.lastTick = Date.now();
    // }
  }
  @SubscribeMessage('lobby:toggle-dance')
  toggleDance(@ConnectedSocket() client: Socket) {
    if (!client.handshake.headers.cookie)
      return client.disconnect(true), void 0;
    // parse session cookie
    // get user from session
    const app = this.rootService.app.getHttpAdapter().getInstance();
    const sessionId = app.parseCookie(client.handshake.headers.cookie).session;
    const session = app.decodeSecureSession(sessionId);
    if (!session || !session.get('user'))
      return client.disconnect(true), void 0;
    const user = session.get('user')!;
    if (!user.loggedIn) return client.disconnect(true), void 0;
    const playerRef = this.players.find((player) => player.userId === user.id);
    if (!playerRef) return client.disconnect(true), void 0;
    playerRef.currentAnimation = playerRef.currentAnimation.includes('dance')
      ? 'idle/down'
      : 'dance';
    this.players.forEach((player) => {
      player.connections.forEach((con: Socket) => {
        con.emit(Lobbies.Packets.Events.UpdatePlayersTransform, {
          players: [
            {
              id: playerRef.userId,
              newAnim: playerRef.currentAnimation,
            },
          ],
        } as Lobbies.Packets.UpdatePlayersTransform);
      });
    });
  }

  @SubscribeMessage('lobby:update-animation')
  throwSnowball(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    if (!client.handshake.headers.cookie)
      return client.disconnect(true), void 0;
    // parse session cookie
    // get user from session
    const app = this.rootService.app.getHttpAdapter().getInstance();
    const sessionId = app.parseCookie(client.handshake.headers.cookie).session;
    const session = app.decodeSecureSession(sessionId);
    if (!session || !session.get('user'))
      return client.disconnect(true), void 0;
    const user = session.get('user')!;
    if (!user.loggedIn) return client.disconnect(true), void 0;
    const playerRef = this.players.find((player) => player.userId === user.id);
    if (!playerRef) return client.disconnect(true), void 0;
    playerRef.currentAnimation = data.anim as IPenguinBaseAnimationsTypes;

    this.players.forEach((player) => {
      player.connections.forEach((con: Socket) => {
        con.emit(Lobbies.Packets.Events.UpdatePlayersTransform, {
          players: [
            {
              id: playerRef.userId,
              newAnim: playerRef.currentAnimation,
            },
          ],
        } as Lobbies.Packets.UpdatePlayersTransform);
      });
    });
  }
}
