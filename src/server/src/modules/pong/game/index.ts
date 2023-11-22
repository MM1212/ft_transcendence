import { Ball } from '@shared/Pong/Ball';
import { ArenaWall } from '@shared/Pong/Collisions/Arena';
import { Game } from '@shared/Pong/Game';
import { Bot } from '@shared/Pong/Paddles/Bot';
import { KeyControls, Player } from '@shared/Pong/Paddles/Player';
import { SpecialPowerType } from '@shared/Pong/SpecialPowers/SpecialPower';
import {
  ETeamSide,
  IGameConfig,
  IPlayerConfig,
} from '@shared/Pong/config/configInterface';

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
    this.config.roomId = this.roomId;
    this.room = server.to(`game-${this.sessionId}`);
    console.log(`game-${this.sessionId}: created`);
  }
  get roomId(): string {
    return `game-${this.sessionId}`;
  }

  public joinGame(socket: Socket) {
    socket.join(this.roomId);
    this.config.nPlayers++;
  }

  public leaveGame(socket: Socket) {
    socket.leave(this.roomId);
    this.config.nPlayers--;
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

  changePartyOwner(userId: string) {
    this.config.partyOwnerId = userId;
  }

  public get nPlayersTeamLeft(): number {
    if (this.config.teams[0].players) {
      return this.config.teams[0].players.length;
    } 
    return 0;
  }

  public get nPlayersTeamRight(): number {
    if (this.config.teams[1].players) {
      return this.config.teams[1].players.length;
    } 
    return 0;
  }

  public  get biggestTeam(): ETeamSide {
    return this.nPlayersTeamLeft > this.nPlayersTeamRight
      ? ETeamSide.Left
      : ETeamSide.Right;
  }

  public  get smallestTeam(): ETeamSide {
    return this.nPlayersTeamLeft < this.nPlayersTeamRight
      ? ETeamSide.Left
      : ETeamSide.Right;
  }

  public setBackOrFront(side: ETeamSide) {
    if (this.config.teams[side]?.players.length === 2) {
      this.config.teams[side].players[1].positionOrder = 'front';
    } else if (this.config.teams[side]?.players.length === 1) {
      this.config.teams[side].players[0].positionOrder = 'back';
    }
  }

  addPlayerToTeam(player: IPlayerConfig, side: ETeamSide | undefined) {
    if (side === undefined) {
      side = this.smallestTeam;
    }
    player.teamId = side;
    this.config.teams[side].players.push(player);
    this.setBackOrFront(side);
  }

  public addPlayerToGame(socket: Socket,player: IPlayerConfig,side: ETeamSide | undefined) {
    this.addPlayerToTeam(player, side);
    this.joinGame(socket);
  }

  public addSpectatorToGame(socket: Socket, player: IPlayerConfig) {
    this.config.spectators.push(player);
    socket.join(this.roomId);
  }

  public createGameSettings(socket: Socket, data: {game: IGameConfig, player: IPlayerConfig}): IGameConfig {
    this.changePartyOwner(data.player.userId);
    this.config = data.game;
    this.addPlayerToTeam(data.player, ETeamSide.Left);
    this.joinGame(socket);
    return this.config;
  }

  public removePlayerFromGame(socket: Socket): void {
    this.leaveGame(socket);
  }

  public getPlayerIndex(socketId: string): number {
    for (const team of this.config.teams) {
      const playerIndex = team.players.findIndex(
        (player: IPlayerConfig) => player.userId === socketId,
      );
      if (playerIndex !== -1) {
        return playerIndex;
      }
    }
    return -1;
  }

  public getPlayer(socketId: string): IPlayerConfig | undefined {
    for (const team of this.config.teams) {
      const player = team.players.find(
        (player: IPlayerConfig) => player.userId === socketId,
      );
      if (player) {
        return player;
      }
    }
    return undefined;
  }

  private updatePlayerInGameConfig(socketId: string, player: IPlayerConfig):void {
    for (const team of this.config.teams) {
      const playerIndex = team.players.findIndex(
        (player: IPlayerConfig) => player.userId === socketId,
      );
      if (playerIndex !== -1) {
        team.players[playerIndex] = player;
      }
    }
  }

  public playerReady(socketId: string):void {
    const playerConf = this.getPlayer(socketId);
    if (playerConf) {
      playerConf.ready = !playerConf.ready;
      this.updatePlayerInGameConfig(socketId, playerConf);
    }
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
