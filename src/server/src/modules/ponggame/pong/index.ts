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
import { PongHistoryService } from '@/modules/ponghistory/history.service';
import PongHistoryModel from '@typings/models/pong/history';
import { PongLobbyService } from '@/modules/ponglobbies/ponglobby.service';
import { PongService } from '../pong.service';
import { Bot } from '@shared/Pong/Paddles/Bot';
import type { LeaderboardService } from '@/modules/leaderboard/leaderboard.service';
import type { UsersService } from '@/modules/users/services/users.service';
import User from '@/modules/users/user';

type Room = BroadcastOperator<DefaultEventsMap, any>;

export class ServerGame extends Game {
  public UUID: string;

  private updateHandle: NodeJS.Timeout | undefined;
  public readonly room: Room;

  public userIdToSocketId: Map<number, string> = new Map(); // matchId, socketId

  public maxScore = 7;
  public nbConnectedPlayers = 0;
  public started = false;

  public spectators: Map<number, ClientSocket> = new Map(); // userId, socket

  // interface can be removed, need to setup one that will
  //  return the results of the game
  constructor(
    public lobbyInterface: PongModel.Models.ILobby,
    public config: PongModel.Models.IGameConfig,
    public server: Server,
    public historyService: PongHistoryService,
    public lobbyService: PongLobbyService,
    public pongService: PongService,
    public usersService: UsersService,
    public leaderboardService: LeaderboardService,
  ) {
    super(
      WINDOWSIZE_X,
      WINDOWSIZE_Y,
      lobbyInterface.gameType as PongModel.Models.LobbyGameType,
    );
    if (config.maxScore >= 1 && config.maxScore <= 100)
      this.maxScore = config.maxScore;
    this.UUID = config.UUID;
    this.room = server.to(this.UUID);
    this.buildObjects();
    this.config.teams[0].players
      .concat(this.config.teams[1].players)
      .forEach((player) => {
        if (player.type === 'bot') {
          this.nbConnectedPlayers++;
          if (player instanceof Bot) {
            player.getBallRef();
          }
        }
      });

    console.log(`Room ${this.UUID}: created`);
  }
  /***/

  get gameInfo(): PongModel.Models.IGameInfoDisplay {
    return {
      UUID: this.UUID,
      score: this.score,
      teams: this.config.teams,
      maxScore: this.maxScore,
      spectatorVisibility: this.lobbyInterface.spectatorVisibility,
    };
  }

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

      if (this.gamemode === PongModel.Models.LobbyGameType.Powers) {
        const [action, powertag] = player.handleShoot();
        switch (action) {
          case SHOOT_ACTION.CREATE:
            this.room.emit(PongModel.Socket.Events.CreatePower, {
              tag: player.tag,
              powertag: powertag,
            });
            this.room.emit(PongModel.Socket.Events.EnergyManaUpdate, [
              {
                tag: player.tag,
                mana: player.mana.manaCur,
                energy: player.energy.energyCur,
              },
            ]);
            break;
          case SHOOT_ACTION.SHOOT:
            this.sendShooterTimeout = player.tag;
            this.room.emit(PongModel.Socket.Events.ShootPower, {
              tag: player.tag,
            });
            break;
        }
      }
    }
  }

  async doSetTimeout(i: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.room.emit(PongModel.Socket.Events.Countdown, { countdown: i });
        resolve();
      }, 1000);
    });
  }

  public async start() {
    console.log(`Game ${this.UUID}: started!`);

    await this.doSetTimeout(3);
    await this.doSetTimeout(2);
    await this.doSetTimeout(1);
    await this.doSetTimeout(0);

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
    this.add(
      new Ball(
        this.width / 2,
        this.height / 2,
        this,
        this.config.ballTexture as keyof typeof ballsConfig,
      ),
    );
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
        this.add(
          new Player(
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
          ),
        );
      } else {
        this.add(
          new Bot(
            startX,
            this.height / 2,
            p.tag,
            direction,
            p.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
            this,
            p.teamId,
            p.paddle as keyof typeof paddleConfig,
            p.userId,
          ),
        );
      }
    }
  }

  handleFocusLoss(userId: number): void {
    const player = this.getPlayerInstanceById(userId);
    if (player) {
      this.handleKeys(userId, player.keys.up, false);
      this.handleKeys(userId, player.keys.down, false);
      this.handleKeys(userId, player.keys.boost, false);
      this.handleKeys(userId, player.keys.shoot, false);
    }
  }

  public sendStartTime(): void {
    this.room.emit(PongModel.Socket.Events.TimeStart, {
      time_start: this.gameStats.startTime,
    });
  }

  static readonly fixedDeltaTime: number = 1000 / 60; // 60 FPS in seconds
  public startTick() {
    let lastTimeStamp = performance.now();
    let lastFPSTimestamp = performance.now();
    this.gameStats.startTimer();
    this.sendStartTime();
    this.gameStats.startNewRound();
    const tick = () => {
      const timestamp = performance.now();
      const deltaTime = timestamp - lastTimeStamp;
      lastTimeStamp = timestamp;
      this.delta = deltaTime / ServerGame.fixedDeltaTime;
      this.update(this.delta);

      if (timestamp - lastFPSTimestamp > 1000) {
        lastFPSTimestamp = timestamp;
      }
    };
    this.updateHandle = setInterval(tick, ServerGame.fixedDeltaTime);
  }

  private calculateMoneyEarned(
    player: Bar,
    playerScore: number,
    winner: number,
  ): void {
    let moneyEarned = 0;

    const baseReward = 5;
    const rarePerformanceMultiplier = 2;
    const epicPerformanceMultiplier = 4;

    moneyEarned = baseReward * (playerScore / 100);

    if (winner === player.teamId) {
      moneyEarned *= 1.5;
    }

    if (moneyEarned > baseReward * 2) {
      moneyEarned *= rarePerformanceMultiplier;
    }
    if (moneyEarned > baseReward * 10) {
      moneyEarned *= epicPerformanceMultiplier;
    }
    moneyEarned = Math.round(moneyEarned * 100);
    player.stats.setMoneyEarned(moneyEarned);
  }

  private calculatePlayerStats(mvpScores: {
    tag: string;
    score: number;
  }): void {
    const winner = this.score[0] > this.score[1] ? 0 : 1;
    for (const player of this.gameObjects) {
      if (player instanceof Bar) {
        player.stats.gameOver();
        const stats = player.stats.exportStats();

        const normalizedGoalScored = stats.goalsScored / 100;
        const normalizedSpecialPowerAccuracy = stats.powerAccuracy / 100;
        const normalizedHittenByPower = stats.hittenByPower / 100;
        const normalizedDirectGoal =
          (stats.bubble_DirectGoal +
            stats.fire_DirectGoal +
            stats.ghost_ScoredOpponentInvisible +
            stats.ice_ScoredOpponentAffected +
            stats.spark_ScoredOpponentAffected) /
          100;

        const normalizedWinningGoal = stats.winningGoal ? 1 : 0;
        const normalizedWinningTeam = winner;

        const weightGoalScored = 0.2;
        const weightSpecialPowerAccuracy = 0.2;
        const weightHittenByPower = 0.1;
        const weightWinningGoal = 0.2;
        const weightWinningTeam = 0.3;
        const weightDirectGoal = 0.2;

        let weightedSum = 0;
        weightedSum =
          normalizedGoalScored * weightGoalScored +
          normalizedSpecialPowerAccuracy * weightSpecialPowerAccuracy -
          normalizedHittenByPower * weightHittenByPower +
          normalizedWinningGoal * weightWinningGoal +
          normalizedDirectGoal * weightDirectGoal +
          normalizedWinningTeam * weightWinningTeam;

        const playerScore = Math.round(weightedSum * 100);

        player.stats.setPlayerScore(playerScore / 10);
        if (playerScore > mvpScores.score) {
          mvpScores.score = playerScore;
          mvpScores.tag = player.tag;
        }
        this.calculateMoneyEarned(player, playerScore, winner);
      }
    }
  }

  // returns value in seconds
  private getElapsedTime(): number {
    return (Date.now() - this.gameStats.startTime) / 1000;
  }

  private async getOtherTeamAverageElo(teamId: number): Promise<number> {
    const otherTeamId = teamId === 0 ? 1 : 0;

    const otherTeam = this.config.teams[otherTeamId].players;

    const user = await this.usersService.get(otherTeam[0]?.userId);
    const user2 = await this.usersService.get(otherTeam[1]?.userId);
    if (!user) return 0;
    if (user2) return (user.elo.rating + user2.elo.rating) / 2;
    else return user.elo.rating;
  }

  private async getMyTeamAverageElo(teamId: number): Promise<number> {
    const myTeam = this.config.teams[teamId].players;

    const user = await this.usersService.get(myTeam[0]?.userId);
    const user2 = await this.usersService.get(myTeam[1]?.userId);
    if (!user) return 0;
    if (user2) return (user.elo.rating + user2.elo.rating) / 2;
    else return user.elo.rating;
  }

  private didIWin(teamId: number): boolean {
    return (teamId === 0 && this.score[0] > this.score[1]) ||
      (teamId === 1 && this.score[1] > this.score[0])
      ? true
      : false;
  }

  private async calculateQuests(
    user: User,
    player: PongHistoryModel.Models.Player,
  ): Promise<void> {
    if (
      (this.didIWin(player.teamId) &&
        player.teamId === 0 &&
        this.score[1] === 0) ||
      (player.teamId === 1 && this.score[0] === 0)
    ) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:perfect',
      );
      await achievement.update((p) => ({ count: p.count + 1 }));
      if (
        this.config.teams[0].players.length === 2 &&
        this.config.teams[1].players.length === 2
      ) {
        const achievement = await user.achievements.get<{ count: number }>(
          'pong:doubles:perfect',
        );
        await achievement.update((p) => ({ count: p.count + 1 }));
      }
    }

    if (this.didIWin(player.teamId) && this.getElapsedTime() < 31) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:fast',
      );
      await achievement.update((p) => ({ count: p.count + 1 }));
    }

    if (
      this.didIWin(player.teamId) &&
      (await this.getMyTeamAverageElo(player.teamId)) + 100 <
        (await this.getOtherTeamAverageElo(player.teamId))
    ) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:underdog',
      );
      await achievement.update((p) => ({ count: p.count + 1 }));
    }

    if (
      this.config.gametype === PongModel.Models.LobbyGameType.Powers &&
      player.stats.shotsFired === 0 &&
      this.didIWin(player.teamId)
    ) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:nopowerups',
      );
      await achievement.update((p) => ({ count: p.count + 1 }));
    }

    if (
      this.didIWin(player.teamId) &&
      user.elo.isWinStreaking &&
      user.elo.streak >= 2
    ) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:winstreak',
      );
      await achievement.update((p) => ({ count: p.count + 1 }));
    }

    if (
      this.didIWin(player.teamId)
      // && colocar aqui chegou a diamond
    ) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:rank:highest',
      );
      await achievement.update((p) => ({ count: p.count + 1 }));
    }

    if (this.didIWin(player.teamId)) {
      const achievement = await user.achievements.get<{
        count: number;
        opponents: number[];
      }>('pong:match:50wins');
      const otherTeamPlayers =
        this.config.teams[player.teamId === 0 ? 1 : 0].players;
      if (!achievement.meta.opponents.includes(otherTeamPlayers[0].userId))
        achievement.meta.opponents.push(otherTeamPlayers[0].userId);
      if (
        otherTeamPlayers[1] &&
        !achievement.meta.opponents.includes(otherTeamPlayers[1].userId)
      )
        achievement.meta.opponents.push(otherTeamPlayers[1].userId);
      await achievement.update((p) => ({
        ...p,
        count: p.opponents.length,
      }));
    }

    const playerBounces = player.stats.ballBounces;
    if (playerBounces > 0) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:bounces',
      );
      await achievement.update((p) => ({ count: p.count + playerBounces }));
    }

    const playerShots = player.stats.shotsFired;
    if (
      this.config.gametype === PongModel.Models.LobbyGameType.Powers &&
      playerShots > 0
    ) {
      const achievement = await user.achievements.get<{ count: number }>(
        'pong:match:shoot_powers',
      );
      await achievement.update((p) => ({ count: p.count + playerShots }));
    }
  }

  public async stop() {
    if (this.updateHandle) {
      clearInterval(this.updateHandle);
      this.updateHandle = undefined;
      console.log(`Game ${this.UUID}: stopped!`);

      this.gameStats.gameOver();
      this.gameStats.teamStats.gameOver();

      const mvpScores = {
        tag: '',
        score: 0,
      };

      // execute all players stats game over
      this.calculatePlayerStats(mvpScores);

      // console.log('team0' , this.gameStats.teamStats.exportStats(0));
      // console.log('team1' , this.gameStats.teamStats.exportStats(1));
      // console.log('game' , this.gameStats.exportStats());
      this.lobbyInterface.teams.forEach((team) => {
        team.score = this.score[team.id];
      });
      const rewards = await this.leaderboardService.computeEndGameElo(
        this.config,
        this.lobbyInterface,
      );

      const getPlayerStats = (
        player: PongModel.Models.IPlayerConfig,
      ): PongHistoryModel.DTO.DB.CreatePlayer => {
        const stats = (
          this.getObjectByTag(player.tag) as Bar
        ).stats.exportStats();
        return {
          gear: {
            paddle: player.paddle,
            specialPower: player.specialPower,
          },
          stats: {
            ...stats,
            elo:
              rewards.find((reward) => reward.userId === player.userId)
                ?.value ?? null,
          },
          mvp: player.tag === mvpScores.tag,
          owner: this.config.ownerId === player.userId,
          userId: player.userId,
          score: stats.playerScore,
          teamId: player.teamId,
        };
      };

      const getTeamStats = (
        team: PongModel.Models.IGameTeam,
      ): PongHistoryModel.DTO.DB.CreateTeam => {
        let wonVal: boolean;
        if (team.id === 0) {
          wonVal = this.score[0] > this.score[1];
        } else {
          wonVal = this.score[0] <= this.score[1];
        }
        const players =
          team.players.map<PongHistoryModel.DTO.DB.CreatePlayer>(
            getPlayerStats,
          );
        return {
          players,
          score: players.reduce(
            (acc, player) => acc + player.stats.playerScore,
            0,
          ),
          stats: this.gameStats.teamStats.exportStats(team.id),
          won: wonVal,
        };
      };

      const creatorMatchHistory: PongHistoryModel.DTO.DB.CreateMatch = {
        winnerTeamId: this.score[0] > this.score[1] ? 0 : 1,
        stats: this.gameStats.exportStats(),
        teams: this.config.teams.map<PongHistoryModel.DTO.DB.CreateTeam>(
          (team) => {
            return getTeamStats(team);
          },
        ),
        type: this.lobbyInterface.queueType,
      };

      if (this.lobbyInterface.queueType !== PongModel.Models.LobbyType.Custom) {
        await Promise.all(
          creatorMatchHistory.teams[0].players
            .concat(creatorMatchHistory.teams[1].players)
            .map(async (player) => {
              const user = await this.usersService.get(player.userId);
              if (!user || user.isBot) return;
              console.log(player);
              await user.credits.add(player.stats.moneyEarned);
            }),
        );
      }

      const matchHistory =
        await this.historyService.saveGame(creatorMatchHistory);
      this.room.emit(PongModel.Socket.Events.Stop, matchHistory);

      setImmediate(async () => {
        this.server.socketsLeave(this.UUID);
        this.shutdown();
        const lobby = await this.lobbyService.getLobby(
          this.lobbyService.usersInGames.get(this.config.ownerId)!,
        );

        for (const userId of this.lobbyService.usersInGames.keys()) {
          if (this.lobbyService.usersInGames.get(userId) === lobby.id) {
            this.lobbyService.usersInGames.delete(userId);
          }
        }
        this.lobbyService.games.delete(lobby.id);
        for (const userId of this.pongService.clientInGames.keys()) {
          if (this.pongService.clientInGames.get(userId) === this.UUID) {
            this.pongService.clientInGames.delete(userId);
          }
        }
        this.pongService.games.delete(this.UUID);
        for await (const team of matchHistory.teams) {
          for await (const player of team.players) {
            const user = await this.usersService.get(player.userId);
            if (!user || user.isBot) continue;
            await this.calculateQuests(user, player);
          }
        }
      });
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
    client.emit(PongModel.Socket.Events.TimeStart, {
      time_start: this.gameStats.startTime,
    });
  }

  public update(delta: number): void {
    if (this.score[0] >= this.maxScore || this.score[1] >= this.maxScore) {
      const ball = this.getObjectByTag(PongModel.InGame.ObjType.Ball) as Ball;

      if (ball.collider === undefined) return;
      for (const player of this.gameObjects) {
        if (player instanceof Bar) {
          if (ball.lastPlayerToTouch === player)
            player.stats.scoredWinningGoal();
        }
      }
      this.stop();
    }
    super.update(delta);

    const players = this.gameObjects.filter(
      (obj) => obj instanceof Bar,
    ) as Bar[];

    const manaEnergyUpdate: PongModel.Socket.Data.EnergyManaUpdate[] = [];
    players.forEach((player) => {
      let push = false;
      if (
        !player.mana.isManaFull() &&
        player.mana.manaCur > player.mana.manaStep + 10
      ) {
        player.mana.manaStep += 10;
        push = true;
      }
      if (
        player instanceof Player &&
        player.keyPressed[player.keys.boost] === true
      ) {
        if (
          !player.energy.isEnergyFull() &&
          player.energy.energyCur <= player.energy.energyStep - 10
        ) {
          player.energy.energyStep -= 10;
          push = true;
        }
      }
      if (
        !player.energy.isEnergyFull() &&
        player.energy.energyCur > player.energy.energyStep + 10
      ) {
        player.energy.energyStep += 10;
        push = true;
      }
      if (push) {
        manaEnergyUpdate.push({
          tag: player.tag,
          mana: player.mana.manaCur,
          energy: player.energy.energyCur,
        });
      }
    });
    if (manaEnergyUpdate.length > 0) {
      this.room.emit(
        PongModel.Socket.Events.EnergyManaUpdate,
        manaEnergyUpdate,
      );
    }

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

    if (this.sendShooterTimeout != '') {
      this.room.emit(PongModel.Socket.Events.ShooterTimeout, {
        tag: this.sendShooterTimeout,
      });
      this.sendShooterTimeout = '';
    }

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

  public getPlayerInstanceById(id: number): Player | undefined {
    return this.gameObjects.find((gameObject: GameObject) => {
      if (gameObject instanceof Player) {
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
