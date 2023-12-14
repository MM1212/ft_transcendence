// import { Ball } from '@shared/Pong/Ball';
// import { ArenaWall } from '@shared/Pong/Collisions/Arena';
// import { Game } from '@shared/Pong/Game';
// import { Bot } from '@shared/Pong/Paddles/Bot';
// import { KeyControls, Player } from '@shared/Pong/Paddles/Player';
// import { SpecialPowerType } from '@shared/Pong/SpecialPowers/SpecialPower';
// import {
//   ETeamSide,
//   IGameConfig,
//   IPlayerConfig,
// } from '@shared/Pong/config/configInterface';

// import {
//   ARENA_SIZE,
//   MULTIPLAYER_START_POS,
//   P_START_DIST,
//   WINDOWSIZE_X,
//   WINDOWSIZE_Y,
// } from '@shared/Pong/main';
// import { Vector2D } from '@shared/Pong/utils/Vector';

// import {
//   DefaultEventsMap,
//   EventsMap,
// } from 'node_modules/socket.io/dist/typed-events';
// import { BroadcastOperator, Server, Socket } from 'socket.io';
// import { GameObject } from '@shared/Pong/GameObject';
// import { Bar } from '@shared/Pong/Paddles/Bar';

// type Room = BroadcastOperator<DefaultEventsMap, any>;

// export class ServerGame extends Game {
//   public sessionId: number;

//   private updateHandle: NodeJS.Timeout | undefined;
//   public readonly room: Room;
//   constructor(
//     public config: IGameConfig,
//     public server: Server,
//     id: number,
//   ) {
//     super(WINDOWSIZE_X, WINDOWSIZE_Y);
//     this.sessionId = id;
//     this.config.roomId = this.roomId;
//     this.room = server.to(`game-${this.sessionId}`);
//     console.log(`game-${this.sessionId}: created`);
//   }

//   // GAME LOGIC 

//   public start() {
//     this.buildObjects();
//     console.log(`Game-${this.roomId}: started!`);
//     this.startTick();
//   }

//   public buildObjects() {
//     this.buildPlayers();
//     this.add(new ArenaWall(new Vector2D(0, 0), new Vector2D(this.width, ARENA_SIZE), 0x00abff, this));
//     this.add(new ArenaWall(new Vector2D(0, this.height - ARENA_SIZE),new Vector2D(this.width, ARENA_SIZE),0x00abff,this));
//     this.add(new Ball(this.width / 2, this.height / 2, this));
//   }

//   public startTick() {
//     let lastTimeStamp = performance.now();
//     let lastFPSTimestamp = performance.now();
//     const fixedDeltaTime: number = 0.01667; // 60 FPS in seconds
//     const tick = () => {
//       const timestamp = performance.now();
//       const deltaTime = (timestamp - lastTimeStamp) / 1000;
//       lastTimeStamp = timestamp;
//       this.delta = deltaTime / fixedDeltaTime;
//       this.update(this.delta);

//       if (timestamp - lastFPSTimestamp > 1000) {
//         lastFPSTimestamp = timestamp;
//       }
//     };
//     this.updateHandle = setInterval(tick, 16);
//   }

//   public getPlayerInstanceById(id: string): Player | undefined {
//     return this.gameObjects.find((gameObject: GameObject) => {
//       if (gameObject instanceof Player) {
//         return gameObject.socketId === id;
//       }
//       return false;
//     }) as Player;
//   }

//   public stop() {
//     if (this.updateHandle) {
//       clearInterval(this.updateHandle);
//       this.updateHandle = undefined;
//     }
//   }

//   public update(delta: number): void {
//     super.update(delta);
//     if (this.sendObjects.length > 0)
//     {
//       this.room.emit('movements', this.sendObjects.map((gameObject: GameObject) => {
//         const temp = {
//           tag: gameObject.tag,
//           position: gameObject.getCenter.toArray(),
//         }
//         return temp;
//       })
//       );
//     } 
//     if (this.sendRemoveObjects.length > 0)
//     {
//       this.room.emit('remove-power', {tag: this.sendRemoveObjects});
//     }
//     if (this.sendShooter.length > 0) {
//       this.room.emit('shooter-update',  {
//           tag: this.sendShooter[0].tag,
//           line: (this.sendShooter[0] as Bar).shooter?.linePositions(),
//       })
//     }
//     if (this.sendEffects.length > 0) {
//       this.room.emit('effect-create-remove', this.sendEffects.map((gameObject: GameObject) => {
//         const temp = {
//           tag: gameObject.tag,
//           effectName: gameObject.getEffect?.effectType,
//           option: gameObject.effectSendOpt
//         }
//         return temp;
//       })
//       );
//     }
//     if (this.sendTeamScored != undefined) {
//       this.room.emit('score-update', {teamId: this.sendTeamScored, score: this.score, scale: this.sendScale});
//     }
    
//   }
//   // MISSING: SpecialPowers in bot
//   private buildPlayers() {
//     const p1Conf = this.config.teams[0].players[0];
//     const p2Conf = this.config.teams[1].players[0];

//     let p1;
//     if (p1Conf.type === 'player') {
//       p1 = new Player(
//         P_START_DIST, 
//         this.height / 2,
//         p1Conf.keys!,
//         "Player 1",
//         new Vector2D(1, 1),
//         p1Conf.specialPower as SpecialPowerType,
//         this,
//         p1Conf.userId,
//       );  
//     } else {
//       p1 = new Bot(
//         P_START_DIST, 
//         this.height / 2,
//         "Player 1",
//         new Vector2D(1, 1),
//         this,
//         );
//       }
//     this.playerTags.push(p1.tag);
//     this.add(p1);

//     let p2;
//     if (p2Conf.type === 'player') {
//       p2 = new Player(
//         this.width - P_START_DIST,
//         this.height / 2,
//         p2Conf.keys!,
//         "Player 2",
//         new Vector2D(-1, 1),
//         p2Conf.specialPower as SpecialPowerType,
//         this,
//         p2Conf.userId,
//       );
      
//     } else {
//       p2 = new Bot(
//         this.width - P_START_DIST,
//         this.height / 2,
//         "Player 2",
//         new Vector2D(-1, 1),
//         this,
//       );
//     }
//     this.playerTags.push(p2.tag);
//     this.add(p2);

//     if (this.config.teams[0].players.length > 1) {
//       const p3Conf = this.config.teams[0].players[1];
//       let p3;
//       if (p3Conf.type === 'player') {
//         p3 = new Player(
//           MULTIPLAYER_START_POS,
//           this.height / 2,
//           p3Conf.keys!,
//           "Player 3",
//           new Vector2D(1, 1),
//           p3Conf.specialPower as SpecialPowerType,
//           this,
//           p3Conf.userId,
//         );
//       } else {
//         p3 = new Bot(
//           MULTIPLAYER_START_POS,
//           this.height / 2,
//           "Player 3",
//           new Vector2D(1, 1),
//           this,
//         );
//       }
//       this.add(p3);
//       this.playerTags.push(p3.tag);
//     }

//     if (this.config.teams[1].players.length > 1) {
//       const p4Conf = this.config.teams[1].players[1];
//       let p4;
//       if (p4Conf.type === 'player') {
//         p4 = new Player(
//           this.width - MULTIPLAYER_START_POS,
//           this.height / 2,
//           p4Conf.keys!,
//           "Player 4",
//           new Vector2D(-1, 1),
//           p4Conf.specialPower as SpecialPowerType,
//           this,
//           p4Conf.userId,
//         );
//       } else {
//         p4 = new Bot(
//           this.width - MULTIPLAYER_START_POS,
//           this.height / 2,
//           "Player 4",
//           new Vector2D(-1, 1),
//           this,
//         );
//       }
//       this.add(p4);
//       this.playerTags.push(p4.tag);
//     }
//   }

//   // CONFIGURATION

//   get roomId(): string {
//     return `game-${this.sessionId}`;
//   }

//   public joinGame(socket: Socket) {
//     socket.join(this.roomId);
//     this.config.nPlayers++;
//   }

//   public leaveGame(socket: Socket) {
//     socket.leave(this.roomId);
//     this.config.nPlayers--;
//   }

//   public changePartyOwner(userId: string) {
//     this.config.partyOwnerId = userId;
//   }

//   public get nPlayersTeamLeft(): number {
//     if (this.config.teams[0].players) {
//       return this.config.teams[0].players.length;
//     } 
//     return 0;
//   }

//   public get nPlayersTeamRight(): number {
//     if (this.config.teams[1].players) {
//       return this.config.teams[1].players.length;
//     } 
//     return 0;
//   }

//   public  get biggestTeam(): ETeamSide {
//     return this.nPlayersTeamLeft > this.nPlayersTeamRight
//       ? ETeamSide.Left
//       : ETeamSide.Right;
//   }

//   public  get smallestTeam(): ETeamSide {
//     return this.nPlayersTeamLeft < this.nPlayersTeamRight
//       ? ETeamSide.Left
//       : ETeamSide.Right;
//   }

//   public setBackOrFront(side: ETeamSide) {
//     if (this.config.teams[side]?.players.length === 2) {
//       this.config.teams[side].players[1].positionOrder = 'front';
//     } else if (this.config.teams[side]?.players.length === 1) {
//       this.config.teams[side].players[0].positionOrder = 'back';
//     }
//   }

//   public addPlayerToTeam(player: IPlayerConfig, side: ETeamSide | undefined) {
//     if (side === undefined) {
//       side = this.smallestTeam;
//     }
//     player.teamId = side;
//     this.config.teams[side].players.push(player);
//     this.setBackOrFront(side);
//   }

//   public addPlayerToGame(socket: Socket,player: IPlayerConfig,side: ETeamSide | undefined) {
//     this.addPlayerToTeam(player, side);
//     this.joinGame(socket);
//   }

//   public addSpectatorToGame(socket: Socket, player: IPlayerConfig) {
//     this.config.spectators.push(player);
//     socket.join(this.roomId);
//   }

//   public createGameSettings(socket: Socket, data: {game: IGameConfig, player: IPlayerConfig}): IGameConfig {
//     this.changePartyOwner(data.player.userId);
//     this.config = data.game;
//     this.addPlayerToTeam(data.player, ETeamSide.Left);
//     this.joinGame(socket);
//     return this.config;
//   }

//   public getPlayerIndex(socketId: string): number {
//     for (const team of this.config.teams) {
//       const playerIndex = team.players.findIndex(
//         (player: IPlayerConfig) => player.userId === socketId,
//       );
//       if (playerIndex !== -1) {
//         return playerIndex;
//       }
//     }
//     return -1;
//   }

//   public getPlayer(socketId: string): IPlayerConfig | undefined {
//     for (const team of this.config.teams) {
//       const player = team.players.find(
//         (player: IPlayerConfig) => player.userId === socketId,
//       );
//       if (player) {
//         return player;
//       }
//     }
//     return undefined;
//   }

//   private updatePlayerInGameConfig(socketId: string, player: IPlayerConfig):void {
//     for (const team of this.config.teams) {
//       const playerIndex = team.players.findIndex(
//         (player: IPlayerConfig) => player.userId === socketId,
//       );
//       if (playerIndex !== -1) {
//         team.players[playerIndex] = player;
//       }
//     }
//   }

//   public playerReady(socketId: string):void {
//     const playerConf = this.getPlayer(socketId);
//     if (playerConf) {
//       playerConf.ready = !playerConf.ready;
//       this.updatePlayerInGameConfig(socketId, playerConf);
//     }
//   }
// }
