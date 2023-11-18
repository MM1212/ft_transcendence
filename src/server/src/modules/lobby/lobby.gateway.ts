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

  constructor(private readonly rootService: AppService) {}
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
      console.log(
        `LobbyGatewa new client connection ${user.nickname}${user.id}, at ${playerRef.connections.length} connections.`,
      );
    } else {
      this.players.push({
        userId: user.id,
        transform: {
          position: { x: LobbyModel.Models.STAGE_WIDTH / 2, y: LobbyModel.Models.STAGE_HEIGHT / 2 },
          velocity: { x: 0, y: 0 },
        },
        currentAnimation: 'idle/down',
        connections: [client],
      });
      console.log(`LobbyGateway client connected ${user.nickname}${user.id}`);
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
    console.log('LobbyGateway client disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): void {
    console.log('LobbyGateway message received', data);

    this.server.emit('new-message', data);
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
        playerRef.transform.velocity.x = pressed ? -1 : 0;
        break;
      case 'KeyD':
        playerRef.transform.velocity.x = pressed ? 1 : 0;
        break;
      case 'KeyW':
        playerRef.transform.velocity.y = pressed ? -1 : 0;
        break;
      case 'KeyS':
        playerRef.transform.velocity.y = pressed ? 1 : 0;
        break;
    }
    playerRef.currentAnimation = anim;
    this.players.forEach((player) => {
      player.connections.forEach((con: Socket) => {
        con.emit(Lobbies.Packets.Events.UpdatePlayersTransform, {
          players: [
            {
              id: playerRef.userId,
              velocity: playerRef.transform.velocity,
              newAnim: playerRef.currentAnimation,
            },
          ],
        } as Lobbies.Packets.UpdatePlayersTransform);
      });
    });
  }
  private lastTick = Date.now();
  onTick() {
    this.players.forEach((player) => {
      player.transform.position.x += player.transform.velocity.x;
      player.transform.position.y += player.transform.velocity.y;
    });
    if (Date.now() - this.lastTick > 1000 / 30) {
      const payload: Lobbies.Packets.UpdatePlayersTransform = {
        players: this.players.map((player) => ({
          id: player.userId,
          ...player.transform,
        })),
      };
      this.players.forEach((player) => {
        player.connections.forEach((con: Socket) => {
          con.emit(Lobbies.Packets.Events.UpdatePlayersTransform, payload);
        });
      });
      this.lastTick = Date.now();
    }
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
    console.log('lobby:update-animation', data.anim, playerRef.userId);
    
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
