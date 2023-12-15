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
// import { Bot } from '@shared/Pong/Paddles/Bot';

type Room = BroadcastOperator<DefaultEventsMap, any>;

export class ServerGame extends Game {
  public UUID: string;

  private updateHandle: NodeJS.Timeout | undefined;
  public readonly room: Room;

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
    this.buildObjects();
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
    this.add(new Ball(this.width / 2, this.height / 2, this));
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

  public update(delta: number): void {
    super.update(delta);
    if (this.sendObjects.length > 0) {
      this.room.emit(
        PongModel.Socket.Events.UpdateMovements,
        this.sendObjects.map((gameObject: GameObject) => {
          return {
            tag: gameObject.tag,
            position: gameObject.getCenter.toArray(),
          };
        }),
      );
    }
    if (this.sendRemoveObjects.length > 0) {
      this.room.emit(PongModel.Socket.Events.RemovePower, {
        tag: this.sendRemoveObjects,
      });
    }
    if (this.sendShooter.length > 0) {
      this.room.emit('shooter-update', {
        tag: this.sendShooter[0].tag,
        line: (this.sendShooter[0] as Bar).shooter?.linePositions(),
      });
    }
    if (this.sendEffects.length > 0) {
      this.room.emit(
        'effect-create-remove',
        this.sendEffects.map((gameObject: GameObject) => {
          const temp = {
            tag: gameObject.tag,
            effectName: gameObject.getEffect?.effectType,
            option: gameObject.effectSendOpt,
          };
          return temp;
        }),
      );
    }
    if (this.sendTeamScored != undefined) {
      this.room.emit('score-update', {
        teamId: this.sendTeamScored,
        score: this.score,
        scale: this.sendScale,
      });
    }
  }
  // MISSING: SpecialPowers in bot
  private buildPlayers() {
    const p1Conf = this.config.teams[0].players[0];
    const p2Conf = this.config.teams[1].players[0];

    let p1;
    if (p1Conf.type === 'player') {
      p1 = new Player(
        P_START_DIST,
        this.height / 2,
        p1Conf.keys!,
        'Player 1',
        new Vector2D(1, 1),
        p1Conf.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
        this,
        p1Conf.userId,
      );
    }
    //else {
    //  p1 = new Bot(
    //    P_START_DIST,
    //    this.height / 2,
    //    "Player 1",
    //    new Vector2D(1, 1),
    //    this,
    //    );
    //  }
    if (p1) {
      this.playerTags.push(p1.tag);
      this.add(p1);
    }

    let p2;
    if (p2Conf.type === 'player') {
      p2 = new Player(
        this.width - P_START_DIST,
        this.height / 2,
        p2Conf.keys!,
        'Player 2',
        new Vector2D(-1, 1),
        p2Conf.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
        this,
        p2Conf.userId,
      );
    }
    //else {
    //  p2 = new Bot(
    //    this.width - P_START_DIST,
    //    this.height / 2,
    //    "Player 2",
    //    new Vector2D(-1, 1),
    //    this,
    //  );
    //}
    if (p2) {
      this.playerTags.push(p2.tag);
      this.add(p2);
    }

    if (this.config.teams[0].players.length > 1) {
      const p3Conf = this.config.teams[0].players[1];
      let p3;
      if (p3Conf.type === 'player') {
        p3 = new Player(
          MULTIPLAYER_START_POS,
          this.height / 2,
          p3Conf.keys!,
          'Player 3',
          new Vector2D(1, 1),
          p3Conf.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
          this,
          p3Conf.userId,
        );
      }
      //  else {
      //    p3 = new Bot(
      //      MULTIPLAYER_START_POS,
      //      this.height / 2,
      //      "Player 3",
      //      new Vector2D(1, 1),
      //      this,
      //    );
      //  }
      if (p3) {
        this.add(p3);
        this.playerTags.push(p3.tag);
      }
    }

    if (this.config.teams[1].players.length > 1) {
      const p4Conf = this.config.teams[1].players[1];
      let p4;
      if (p4Conf.type === 'player') {
        p4 = new Player(
          this.width - MULTIPLAYER_START_POS,
          this.height / 2,
          p4Conf.keys!,
          'Player 4',
          new Vector2D(-1, 1),
          p4Conf.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
          this,
          p4Conf.userId,
        );
      }
      // else {
      //  p4 = new Bot(
      //  this.width - MULTIPLAYER_START_POS,
      //  this.height / 2,
      //  "Player 4",
      //  new Vector2D(-1, 1),
      //  this,
      //  );
      //  }
      if (p4) {
        this.add(p4);
        this.playerTags.push(p4.tag);
      }
    }
  }
  /***/
  public getPlayerInstanceById(id: number): Player | undefined {
    return this.gameObjects.find((gameObject: GameObject) => {
      if (gameObject instanceof Player) {
        console.log(gameObject.socketId, id);
        return gameObject.socketId === id;
      }
      return false;
    }) as Player;
  }

  public joinPlayer(
    client: ClientSocket,
    player: PongModel.Models.IPlayerConfig,
  ): void {
    client.join(this.UUID);
    player.connected = true;
    this.nbConnectedPlayers++;
    console.log(`> Player ${player.nickname} joined room ${this.UUID} <`);
  }

  public leavePlayer(
    client: ClientSocket,
    player: PongModel.Models.IPlayerConfig,
  ): void {
    client.leave(this.UUID);
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
