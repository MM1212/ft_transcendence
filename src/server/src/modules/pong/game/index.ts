import { Ball } from '@shared/Pong/Ball';
import { ArenaWall } from '@shared/Pong/Collisions/Arena';
import { Game } from '@shared/Pong/Game';
import { Bot } from '@shared/Pong/Paddles/Bot';
import { KeyControls, Player } from '@shared/Pong/Paddles/Player';
import { SpecialPowerType } from '@shared/Pong/SpecialPowers/SpecialPower';
import { IGameConfig, IPlayerConfig } from '@shared/Pong/config/configInterface';

import {
  ARENA_SIZE,
  MULTIPLAYER_START_POS,
  P_START_DIST,
  WINDOWSIZE_X,
  WINDOWSIZE_Y,
} from '@shared/Pong/main';
import { Vector2D } from '@shared/Pong/utils/Vector';

import {
  DefaultEventsMap,
  EventsMap,
} from 'node_modules/socket.io/dist/typed-events';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { PongGateway } from '../pong.gateway';



const defaultKeyControls = {
  up: 'w',
  down: 's',
  boost: 'a',
  shoot: 'q',
};

type Room = BroadcastOperator<DefaultEventsMap, any>;

export class ServerGame extends Game {
  
  public sessionId: number;
  
  //private nConnectedPlayers = 0;
  private updateHandle: NodeJS.Timeout | undefined;
  public readonly room: Room;
  constructor(
    public config: IGameConfig,
    server: Server,
    id: number,
  ) {
    super(WINDOWSIZE_X, WINDOWSIZE_Y);
    this.sessionId = id;
    this.room = server.to(`game-${this.sessionId}`);
    console.log(`game-${this.sessionId}: created`);
  }
  get roomId(): string {
    return `game-${this.sessionId}`;
  }

  public join(socket: Socket) {
    socket.join(this.roomId);
    this.config.nPlayers++;
    console.log(`Player: ${socket.id} joined: game-${this.sessionId}`);
  }

  public leave(socket: Socket) {
    socket.leave(this.roomId);
    this.config.nPlayers--;
    console.log(`Player: ${socket.id} left: game-${this.sessionId}`);
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
    // console.log(this.getObjectByTag('Bolinha')?.getVelocity);
    const ball = this.getObjectByTag('Bolinha');
    this.room.emit('movements', [
      {
        tag: ball?.tag,
        position: ball?.getCenter.toArray(),
      },
    ]);
  }

  public ready() {
    //set player ready variable to true
  }
  // private buildPlayer(player: IPlayerConfig) {
  //   let p;
  //   let startX;
  //   let tag;
  //   switch (player.name) {
  //     case 'Player1': {
  //       startX = P_START_DIST;
  //       if (player.type instanceof Player) {
  //         tag = 'Player1';
  //       } else {
  //         tag = 'Bot1';
  //       }
  //       break;
  //     }
  //     case 'Player2': {
  //       startX = this.width - P_START_DIST;
  //       if (player.type instanceof Player) {
  //         tag = 'Player2';
  //       } else {
  //         tag = 'Bot2';
  //       }
  //       break;
  //     }
  //     case 'Player3': {
  //       startX = MULTIPLAYER_START_POS;
  //       if (player.type instanceof Player) {
  //         tag = 'Player3';
  //       } else {
  //         tag = 'Bot3';
  //       }
  //       break;
  //     }
  //     case 'Player4': {
  //       startX = this.width - MULTIPLAYER_START_POS;
  //       if (player.type instanceof Player) {
  //         tag = 'Player4';
  //       } else {
  //         tag = 'Bot4';
  //       }
  //       break;
  //     }
  //   }
  //   player.type instanceof Player
  //     ? (p = new Player(
  //         startX,
  //         this.height / 2,
  //         player.keys ?? defaultKeyControls,
  //         tag,
  //         new Vector2D(1, 1),
  //         player.specialPower,
  //         this,
  //       ))
  //     : (p = new Bot(startX, this.height / 2, tag, new Vector2D(1, 1), this));
  //   this.add(p);
  // }

  

  // public buildObjects() {
    // for (const player of ) {
      // if (player !== undefined) {
        // this.buildPlayer(player);
      // }
    // }
// 
    // this.add(
      // new ArenaWall(
        // new Vector2D(0, 0),
        // new Vector2D(this.width, ARENA_SIZE),
        // 0x00abff,
        // this,
      // ),
    // );
    // this.add(
      // new ArenaWall(
        // new Vector2D(0, this.height - ARENA_SIZE),
        // new Vector2D(this.width, ARENA_SIZE),
        // 0x00abff,
        // this,
      // ),
    // );
    // this.add(new Ball(this.width / 2, this.height / 2, this));
  // }

  
  
  // public start() {
    //this.buildObjects()
  //   console.log(`Game-${this.id}: created`);
  //startTick()
  // }

  
}
