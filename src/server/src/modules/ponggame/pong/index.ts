import { Game } from '@shared/Pong/Game';
import {
  ARENA_SIZE,
  MULTIPLAYER_START_POS,
  P_START_DIST,
  WINDOWSIZE_X,
  WINDOWSIZE_Y,
} from '@shared/Pong/main';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events';
import { BroadcastOperator } from 'socket.io';
import PongModel from '@typings/models/pong';
import { ClientSocket } from '@typings/ws';
import { Player, SHOOT_ACTION } from '@shared/Pong/Paddles/Player';
import { GameObject } from '@shared/Pong/GameObject';
import { ArenaWall } from '@shared/Pong/Collisions/Arena';
import { Vector2D } from '@shared/Pong/utils/Vector';
import { Ball } from '@shared/Pong/Ball';
import { Bar } from '@shared/Pong/Paddles/Bar';
import { ballsConfig, paddleConfig } from '@shared/Pong/config/configInterface';
// import { Bot } from '@shared/Pong/Paddles/Bot';

type Room = BroadcastOperator<DefaultEventsMap, any>;

export class ServerGame extends Game {
  public UUID: string;

  private updateHandle: NodeJS.Timeout | undefined;
  public readonly room: Room;

  public userIdToSocketId: Map<number, string> = new Map(); // matchId, socketId

  public nbConnectedPlayers = 0;
  public started = false;

  public spectators: Map<number, ClientSocket> = new Map(); // userId, socket

  // interface can be removed, need to setup one that will
  //  return the results of the game
  constructor(
    public lobbyInterface: PongModel.Models.ILobby,
    public config: PongModel.Models.IGameConfig,
    public server: Server,
  ) {
    super(WINDOWSIZE_X, WINDOWSIZE_Y);

    this.UUID = config.UUID;
    this.room = server.to(this.UUID);
    this.buildObjects();
    console.log(`Room ${this.UUID}: created`);
  }
  /***/

  public checkStart() {
    if (
      this.started === false &&
      this.nbConnectedPlayers === this.lobbyInterface.nPlayers
    ) {
      this.started = true;
      this.start();
    }
  }

  public handleKeys(clientId: number, key: string, state: boolean): void {
    const player = this.getPlayerInstanceById(clientId);
    if (player) {
      if (state) player.onKeyDown(key);
      else player.onKeyUp(key);

      const [action, powertag] = player.handleShoot();
      switch (action) {
        case SHOOT_ACTION.CREATE:
          this.room.emit(PongModel.Socket.Events.CreatePower, {
            tag: player.tag,
            powertag: powertag,
          });
          break;
        case SHOOT_ACTION.SHOOT:
          this.room.emit(PongModel.Socket.Events.ShootPower, {
            tag: player.tag,
          });
          break;
      }
    }
  }

  public start() {
    
    console.log(`Game ${this.UUID}: started!`);
    this.room.emit(PongModel.Socket.Events.Start);
    this.startTick();
  }

  public buildObjects() {
    this.buildPlayers();
    this.add(
      new ArenaWall(
        new Vector2D(0, 0),
        new Vector2D(this.width, ARENA_SIZE),
        0x00abff,
        this,
      ),
    );
    this.add(
      new ArenaWall(
        new Vector2D(0, this.height - ARENA_SIZE),
        new Vector2D(this.width, ARENA_SIZE),
        0x00abff,
        this,
      ),
    );
    this.add(new Ball(this.width / 2, this.height / 2, this, this.config.ballTexture as keyof typeof ballsConfig));
  }

  private buildPlayers(): void {
    const players = this.config.teams[0].players.concat(
      this.config.teams[1].players,
    );
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      let startX;
      if (p.positionOrder === 'back') {
        startX = P_START_DIST;
      } else {
        startX = MULTIPLAYER_START_POS;
      }
      let direction;
      if (p.teamId === 1) {
        startX = this.width - startX;
        direction = new Vector2D(-1, 1);
      } else {
        direction = new Vector2D(1, 1);
      }
      
      if (players[i].type === 'player') {
        this.add( new Player(
          startX,
          this.height / 2,
          p.keys!,
          p.tag,
          direction,
          p.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
          this,
          p.teamId,
          p.paddle as keyof typeof paddleConfig,
          p.userId,
        ));
      } else {
        // MISSING: SpecialPowers in bot
        //this.add( new Bot (
        //  
        //))
      }
    }
  }

  public startTick() {
    let lastTimeStamp = performance.now();
    let lastFPSTimestamp = performance.now();
    const fixedDeltaTime: number = 0.01667; // 60 FPS in seconds
    const tick = () => {
      const timestamp = performance.now();
      const deltaTime = (timestamp - lastTimeStamp) / 1000;
      lastTimeStamp = timestamp;
      this.delta = deltaTime / fixedDeltaTime;
      this.update(this.delta);

      if (timestamp - lastFPSTimestamp > 1000) {
        lastFPSTimestamp = timestamp;
      }
    };
    this.updateHandle = setInterval(tick, 16);
  }

  public stop() {
    if (this.updateHandle) {
      clearInterval(this.updateHandle);
      this.updateHandle = undefined;
    }
  }

  private emitMappedValues<T, U>(
    eventName: string,
    objects: T[],
    mapFunc: (item: T) => U,
  ): void {
    if (objects.length > 0) {
      const mappedObjects = objects.map(mapFunc);
      this.room.emit(eventName, mappedObjects);
    }
  }

  public emitUpdateGame(client: ClientSocket): void {
    client.emit(PongModel.Socket.Events.UpdateScore, {
      score: this.score,
      paddles: this.gameObjects
        .filter((obj) => obj instanceof Bar)
        .map((obj: GameObject) => {
          return {
            tag: obj.tag,
            scale: (obj as Bar).getScale,
            height: (obj as Bar).HeightVal,
            width: (obj as Bar).WidthVal,
            x: (obj as Bar).getCenter.x,
            y: (obj as Bar).getCenter.y,
          };
        }),
    });
  }

  public update(delta: number): void {
    super.update(delta);

    this.emitMappedValues<GameObject, PongModel.Socket.Data.UpdateMovements>(
      PongModel.Socket.Events.UpdateMovements,
      this.sendObjects,
      (gameObject: GameObject) => {
        return {
          tag: gameObject.tag,
          position: gameObject.getCenter.toArray(),
        };
      },
    );

    if (this.sendRemoveObjects.length > 0) {
      this.room.emit(PongModel.Socket.Events.RemovePower, {
        tag: this.sendRemoveObjects,
      });
    }

    if (this.sendShooter.length > 0) {
      this.room.emit(PongModel.Socket.Events.UpdateShooter, {
        tag: this.sendShooter[0].tag,
        line: (this.sendShooter[0] as Bar).shooter?.linePositions(),
      });
    }

    this.emitMappedValues<GameObject, PongModel.Socket.Data.EffectCreateRemove>(
      PongModel.Socket.Events.EffectCreateRemove,
      this.sendEffects,
      (gameObject: GameObject) => {
        return {
          tag: gameObject.tag,
          effectName: gameObject.getEffect?.effectType,
          option: gameObject.effectSendOpt,
        };
      },
    );

    if (this.sendPaddlesScale.length > 0 || this.scored === true) {
      this.room.emit(PongModel.Socket.Events.UpdateScore, {
        score: this.score,
        paddles: this.sendPaddlesScale.map<PongModel.Socket.Data.PaddleInfo>(
          (obj: GameObject) => {
            return {
              tag: obj.tag,
              scale: (obj as Bar).getScale,
              height: (obj as Bar).HeightVal,
              width: (obj as Bar).WidthVal,
              x: (obj as Bar).getCenter.x,
              y: (obj as Bar).getCenter.y,
            };
          },
        ),
      });
    }
  }


  /***/
  public getPlayerInstanceById(id: number): Player | undefined {
    return this.gameObjects.find((gameObject: GameObject) => {
      if (gameObject instanceof Player) {
        console.log(gameObject.userId, id);
        return gameObject.userId === id;
      }
      return false;
    }) as Player;
  }

  public joinPlayer(
    client: ClientSocket,
    player: PongModel.Models.IPlayerConfig,
  ): void {
    client.join(this.UUID);
    this.userIdToSocketId.set(player.userId, client.id);
    player.connected = true;
    this.nbConnectedPlayers++;
    console.log(`> Player ${player.nickname} joined room ${this.UUID} <`);
  }

  public leavePlayer(
    client: ClientSocket,
    player: PongModel.Models.IPlayerConfig,
  ): void {
    client.leave(this.UUID);
    this.userIdToSocketId.delete(player.userId);
    player.connected = false;
    this.nbConnectedPlayers--;
    console.log(`> Player ${player.nickname} left room ${this.UUID} <`);
  }

  public joinSpectators(client: ClientSocket): void {
    this.spectators.set(client.data.user.id, client);
    client.join(this.UUID);
    console.log(`> Spectator joined room ${this.UUID} <`);
  }

  public leaveSpectators(client: ClientSocket): void {
    this.spectators.delete(client.data.user.id);
    client.leave(this.UUID);
    console.log(`> Spectator left room ${this.UUID} <`);
  }

  public getPlayerByUserId(
    userId: number,
  ): PongModel.Models.IPlayerConfig | null {
    for (const team of this.config.teams) {
      for (const player of team.players) {
        if (player.userId === userId) return player;
      }
    }
    return null;
  }

  public getSpectatorSocketByUserId(userId: number): ClientSocket | null {
    return this.spectators.get(userId) || null;
  }

  public getConnectedPlayers(): PongModel.Models.IPlayerConfig[] {
    const connectedPlayers = [];
    for (const team of this.config.teams) {
      for (const player of team.players) {
        if (player.connected) connectedPlayers.push(player);
      }
    }
    return connectedPlayers;
  }
}