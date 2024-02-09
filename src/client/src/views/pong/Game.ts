import * as PIXI from 'pixi.js';
import { UIBall } from './Ball';
import { Game } from '@shared/Pong/Game';
import { UIGameObject } from './GameObject';
import { Vector2D } from './utils/Vector';
import { UIArenaWall } from './Collisions/Arena';
import { Debug } from './utils/Debug';
import {
  countdownStyleSettings,
  drawLines,
  scoreStyleSettings,
} from './utils/drawUtils';
import { UIPlayer } from './Paddles/Player';
import {
  ARENA_SIZE,
  MULTIPLAYER_START_POS,
  P_START_DIST,
  WINDOWSIZE_X,
  WINDOWSIZE_Y,
} from '@shared/Pong/main';

//import { UIBot } from "./Paddles/Bot";
import { Socket } from 'socket.io-client';
import { GameObject, effectSendOption } from '@shared/Pong/GameObject';
import { UIBubble } from './SpecialPowers/Bubble';
import { UIFire } from './SpecialPowers/Fire';
import { UIGhost } from './SpecialPowers/Ghost';
import { UIIce } from './SpecialPowers/Ice';
import { UISpark } from './SpecialPowers/Spark';
import { UIEffect } from './SpecialPowers/Effect';
import PongModel from '@typings/models/pong';
import { Ball } from '@shared/Pong/Ball';
import { ballsConfig, paddleConfig } from '@shared/Pong/config/configInterface';
import {
  BackgroundTex,
  DisconnectWindowTex,
  ScoreTex,
  TimeBorderTex,
} from './utils';
import { UIBot } from './Paddles/Bot';
import moment from 'moment';

type Powers = UIBubble | UIFire | UIGhost | UIIce | UISpark;

export class UIGame extends Game {
  private background: PIXI.Sprite;
  private scoreBorder: PIXI.Sprite[];

  public app: PIXI.Application;
  public debug: Debug;
  private scoreElementLeft: PIXI.Text = new PIXI.Text('');
  private scoreElementRight: PIXI.Text = new PIXI.Text('');

  private scoreStyle: PIXI.TextStyle = new PIXI.TextStyle(scoreStyleSettings);

  public disconnectWindow: PIXI.Sprite = new PIXI.Sprite(DisconnectWindowTex);

  public disconnectedPlayers: { tag: string; nickname: string }[] = [];
  public disconnectedPrint: PIXI.Text = new PIXI.Text('');

  public randomBordersSelected: number[] = [];
  public timeBorder: PIXI.Sprite;
  public timeText: PIXI.Text = new PIXI.Text('');

  public startTime: number = 0; //ms
  public started = false;
  public timePassed: number = 0; //ms

  public roomId: string;

  public scorePosition1: [number, number] = [0, 0];
  public scorePosition2: [number, number] = [0, 0];

  constructor(
    public readonly socket: Socket,
    container: HTMLDivElement,
    private gameConfig: PongModel.Models.IGameConfig,
    public readonly nickname: string,
    private readonly userId: number
  ) {
    super(WINDOWSIZE_X, WINDOWSIZE_Y);
    this.roomId = gameConfig.UUID;

    this.app = new PIXI.Application({
      background: '#000000',
      antialias: true,
      width: WINDOWSIZE_X,
      height: WINDOWSIZE_Y,
    });
    this.app.renderer.background.color = '#000000';
    this.background = new PIXI.Sprite(BackgroundTex);
    this.background.x = WINDOWSIZE_X / 2;
    this.background.y = WINDOWSIZE_Y / 2;
    this.background.anchor.set(0.5);
    this.background.alpha = 0.3;
    this.app.stage.addChild(this.background);
    this.scorePosition1 = [
      this.app.view.width / 2 - this.app.view.width / 12,
      this.app.view.height / 16,
    ];
    this.scorePosition2 = [
      this.app.view.width / 2 + this.app.view.width / 12,
      this.app.view.height / 16,
    ];

    this.timeBorder = new PIXI.Sprite(TimeBorderTex);
    this.timeBorder.x = this.app.view.width / 2;
    this.timeBorder.y = this.app.view.height / 16;
    this.timeBorder.anchor.set(0.5);
    this.timeText = new PIXI.Text('00:00', scoreStyleSettings);
    this.timeText.style.fontSize = 22;
    this.timeText.anchor.set(0.5);
    this.timeText.x = this.app.view.width / 2;
    this.timeText.y = this.app.view.height / 16;

    drawLines(0xffffff, this.app);

    this.drawPlayers(gameConfig);

    this.add(
      new UIArenaWall(
        new Vector2D(0, 0),
        new Vector2D(this.width, ARENA_SIZE),
        0x00abff,
        this
      )
    );
    this.add(
      new UIArenaWall(
        new Vector2D(0, this.height - ARENA_SIZE),
        new Vector2D(this.width, ARENA_SIZE),
        0x00abff,
        this
      )
    );

    this.add(
      new UIBall(
        this.width / 2,
        this.height / 2,
        this,
        gameConfig.ballTexture as keyof typeof ballsConfig
      )
    );

    this.scoreBorder = [new PIXI.Sprite(ScoreTex), new PIXI.Sprite(ScoreTex)];
    this.scoreBorder[0].anchor.set(0.5);
    this.scoreBorder[1].anchor.set(0.5);
    this.scoreBorder[0].x = this.scorePosition1[0];
    this.scoreBorder[0].y = this.scorePosition1[1];
    this.scoreBorder[1].x = this.scorePosition2[0];
    this.scoreBorder[1].y = this.scorePosition2[1];
    this.app.stage.addChild(this.scoreBorder[0]);
    this.app.stage.addChild(this.scoreBorder[1]);
    this.app.stage.addChild(this.timeBorder);
    this.app.stage.addChild(this.timeText);
    this.timeText.visible = false;


    this.setDisconnectedWindow();

    this.setScoreElements();

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('focusout', this.handleLostOfFocus);

    this.debug = new Debug(this.app);
    this.app.stage.sortableChildren = true;

    this.socket.emit(PongModel.Socket.Events.UpdateDisconnected, {
      roomId: this.roomId,
    });

    const resizeHandler = this.handleResize.bind(this);
    window.addEventListener('resize', resizeHandler);

    container.appendChild(this.app.view as HTMLCanvasElement);
  }

  private handleResize(): void {
    if (!this.app.stage) return;
    this.app.view.width = window.innerWidth;
    this.app.view.height = window.innerHeight;
    this.app.resizeTo = window;
    if (this.app.resizeTo) {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }
    console.log('RESIZE = ' + window.innerWidth + ' ' + window.innerHeight);
    this.app.render();
  }

  setScoreElements(): void {
    // change this
    this.scoreElementLeft = new PIXI.Text(this.score[0], this.scoreStyle);
    this.scoreElementRight = new PIXI.Text(this.score[1], this.scoreStyle);
    this.scoreElementLeft.anchor.set(0.5);
    this.scoreElementRight.anchor.set(0.5);
    this.scoreElementLeft.x = this.scorePosition1[0];
    this.scoreElementLeft.y = this.scorePosition1[1];
    this.scoreElementRight.x = this.scorePosition2[0];
    this.scoreElementRight.y = this.scorePosition2[1];
    this.app.stage.addChild(this.scoreElementLeft);
    this.app.stage.addChild(this.scoreElementRight);
  }

  setDisconnectedWindow(): void {
    this.disconnectWindow.x =
      this.app.view.width / 2 - this.disconnectWindow.width / 2;
    this.disconnectWindow.y =
      this.app.view.height / 2 - this.disconnectWindow.height / 2;
    this.disconnectWindow.alpha = 0.8;
    this.disconnectWindow.visible = false;
    this.app.stage.addChild(this.disconnectWindow);
    this.disconnectedPrint = new PIXI.Text('', scoreStyleSettings);
    this.disconnectedPrint.x =
      this.app.view.width / 2 - this.disconnectedPrint.width / 2;
    this.disconnectedPrint.y =
      this.app.view.height / 2 - this.disconnectedPrint.height / 2;
    this.disconnectedPrint.anchor.set(0.5);
    this.disconnectedPrint.alpha = 0.8;
    this.app.stage.addChild(this.disconnectedPrint);
    this.disconnectedPrint.visible = true;
  }

  getPlayerByUserId(userId: number): UIPlayer | undefined {
    return this.gameObjects.find((e) => {
      if (e instanceof UIPlayer) {
        return e.userId === userId;
      }
      return false;
    }) as UIPlayer;
  }

  updateDisconnectedRefresh(userIds: number[]): void {
    this.disconnectedPlayers.length = 0;
    let disconnectedText = '';
    console.log(userIds);

    for (let i = 0; i < userIds.length; i++) {
      console.log(userIds[i]);
      const player = this.getPlayerByUserId(userIds[i]);
      console.log(player);
      if (player) {
        player.displayObject.alpha = 0.5;
        this.disconnectedPlayers.push({
          tag: player.tag,
          nickname: player.nickname,
        });
        disconnectedText += player.nickname + '\n';
      }
    }
    this.disconnectedPrint.text = `Disconnected Players: ${this.disconnectedPlayers.length}\n${disconnectedText}`;
    this.disconnectedPrint.visible = true;
    this.disconnectWindow.visible = true;
  }

  updateDisconnected(nickname: string, tag: string) {
    this.disconnectedPlayers.push({ tag: tag, nickname: nickname });
    if (this.disconnectedPlayers.length > 0) {
      let disconnectedText = '';
      this.disconnectedPlayers.forEach((player) => {
        disconnectedText += player.nickname + '\n';
      });
      const obj = this.getObjectByTag(tag) as UIGameObject;
      if (obj) obj.displayObject.alpha = 0.5;
      this.disconnectedPrint.text = `Disconnected Players: ${this.disconnectedPlayers.length}\n${disconnectedText}`;
      this.disconnectedPrint.visible = true;
      this.disconnectWindow.visible = true;
    }
  }

  updateReconnected(nickname: string, tag: string) {
    this.disconnectedPlayers = this.disconnectedPlayers.filter(
      (player) => player.nickname !== nickname
    );
    if (this.disconnectedPlayers.length > 0) {
      let disconnectedText = '';
      this.disconnectedPlayers.forEach((player) => {
        disconnectedText += player.nickname + '\n';
        const obj = this.getObjectByTag(player.tag) as UIGameObject;
        if (obj) obj.displayObject.alpha = 0.5;
        console.log('PLAYER: ' + player.tag);
      });
      const obj = this.getObjectByTag(tag) as UIGameObject;
      if (obj) obj.displayObject.alpha = 1;
      this.disconnectedPrint.text = `Disconnected Players: ${this.disconnectedPlayers.length}\n${disconnectedText}`;
      this.disconnectedPrint.visible = true;
      this.disconnectWindow.visible = true;
    } else {
      this.disconnectedPrint.visible = false;
      this.disconnectWindow.visible = false;
      const obj = this.getObjectByTag(tag) as UIGameObject;
      if (obj) obj.displayObject.alpha = 1;
    }
  }

  handleLostOfFocus = () => {
    if (this.gameConfig.spectators.includes(this.userId)) return;

    this.socket.emit(PongModel.Socket.Events.FocusLoss, {
      roomId: this.roomId,
    });
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (this.gameConfig.spectators.includes(this.userId)) return;

    if (e.key && e.repeat === false && e.shiftKey === false) {
      // (this.AllPlayersNicks)
      this.socket.emit(PongModel.Socket.Events.KeyPress, {
        key: e.key.toLowerCase(),
        state: true,
      });
    }
    if (e.key === 'p') {
      this.debug.isDebug = !this.debug.isDebug;
    }
  };

  handleKeyUp = (e: KeyboardEvent) => {
    if (this.gameConfig.spectators.includes(this.userId)) return;

    this.socket.emit(PongModel.Socket.Events.KeyPress, {
      key: e.key.toLowerCase(),
      state: false,
    });
  };

  handleMovements(data: PongModel.Socket.Data.UpdateMovements[]) {
    data.forEach((e) => {
      const obj = this.getObjectByTag(e.tag) as UIGameObject;
      if (obj) {
        obj.setCenter(new Vector2D(e.position[0], e.position[1]));
        obj.displayObject.x = obj.getCenter.x;
        obj.displayObject.y = obj.getCenter.y;
      }
    });
  }

  getObjectWithType(obj: UIGameObject): Powers | undefined {
    const powers = PongModel.Models.LobbyParticipantSpecialPowerType;
    if (obj.tag.includes(powers.bubble)) return obj as unknown as UIBubble;
    if (obj.tag.includes(powers.fire)) return obj as unknown as UIFire;
    if (obj.tag.includes(powers.ghost)) return obj as unknown as UIGhost;
    if (obj.tag.includes(powers.ice)) return obj as unknown as UIIce;
    if (obj.tag.includes(powers.spark)) return obj as unknown as UISpark;
    return undefined;
  }

  // specialpower.removePower() is a handler for the collision, it's data is erased here
  handleRemovePower(obj: UIGameObject) {
    const specialpower = this.getObjectWithType(obj);
    if (specialpower) {
      console.log('REMOVING: ' + specialpower.tag);
      specialpower.removePower();
      specialpower.displayObject?.destroy();
      this.app.stage.removeChild(specialpower.displayObject);
      this.gameObjects = this.gameObjects.filter((e) => e !== specialpower);
    }
  }

  updatePaddleSizes(paddles: PongModel.Socket.Data.PaddleInfo[]) {
    paddles.forEach((e) => {
      const obj = this.getObjectByTag(e.tag) as UIPlayer;
      if (obj) {
        console.log(e.tag + ' ' + e.height + ' ' + e.width);
        obj.setScaleDisplay(e.scale, e.height, e.width, e.x, e.y);
      }
    });
  }

  handleEffect(
    obj: UIGameObject,
    effectName: string | undefined,
    option: effectSendOption
  ): void {
    if (option === effectSendOption.REMOVE) {
      console.log(effectName + ' removed on ' + obj.tag);
      if (obj.effect?.name === 'INVISIBLE') obj.displayObject.alpha = 1;
      obj.effect = undefined;
    } else if (option === effectSendOption.SEND) {
      console.log(effectName + ' added on ' + obj.tag);
      if (effectName) obj.setEffect(new UIEffect(effectName, obj));
    }
  }

  countdown(n: number): void {
    if (this.app.stage) {
      const style = new PIXI.TextStyle(countdownStyleSettings);
      const countdown = new PIXI.Text(n.toString(), style);
      if (n === 0) countdown.text = 'GO!';
      countdown.anchor.set(0.5);
      countdown.x = this.app.view.width / 2;
      countdown.y = this.app.view.height / 2;
      this.app.stage.addChild(countdown);

      let i = 0;
      setInterval(() => {
        countdown.alpha = 1 - i / 40;
        if (i < 25) countdown.scale.set(1 + i / 10);
        i++;
      }, 30);

      setTimeout(() => {
        this.app.stage.removeChild(countdown);
      }, 800);
    }
    if (n === 0) {
      this.started = true;
      this.timeText.visible = true;
    }
  }

  private tickRef: PIXI.TickerCallback<any> | undefined;
  start() {
    this.disconnectWindow.visible = false;
    this.disconnectedPrint.visible = false;
    this.disconnectedPlayers.length = 0;
    this.timePassed = 0;
    this.tickRef = (_delta: number) => {
      this.update(_delta);
    };
    this.app.ticker.maxFPS = 60;
    this.app.ticker.minFPS = 60;
    this.app.ticker.add(this.tickRef);
  }

  gameOver() {
    if (this.tickRef) {
      this.app.ticker.stop();
      this.app.ticker.remove(this.tickRef);
      this.app.ticker.destroy();
    }
    this.tickRef = undefined;
  }

  updateScore(
    updatedScore: [number, number],
    paddles: PongModel.Socket.Data.PaddleInfo[]
  ) {
    this.score = updatedScore;
    this.scoreElementLeft.text = this.score[0];
    this.scoreElementRight.text = this.score[1];
    this.updatePaddleSizes(paddles);
  }

  private lastRenderTimePassed = Date.now();
  renderTimePassed() {
    if (this.started === true && Date.now() - this.lastRenderTimePassed > 250) {
      this.lastRenderTimePassed = Date.now();
      this.timePassed = Date.now() - this.startTime;
      this.timeText.text = moment.utc(this.timePassed).format('mm:ss');
    }
  }

  updateStartTime(time_start: number) {
    this.startTime = time_start;

    console.log('START TIME: ' + this.started);
  }

  update(delta: number) {
    if (this.run) {
      // TODO date now packet server
      this.renderTimePassed();

      this.debug.debugDraw(this.gameObjects as UIGameObject[]);

      this.gameObjects.forEach((gameObject) => {
        gameObject.update(delta);
      });
    }
  }

  public add(gameObject: UIGameObject) {
    this.gameObjects.push(gameObject);
    this.app.stage.addChild(gameObject.displayObject);
  }

  protected removeObjects(): void {
    this.app.stage.removeChild(
      ...(this.remove_gameObjects as UIGameObject[]).map((e) => e.displayObject)
    );
    (this.remove_gameObjects as UIGameObject[]).forEach((e) =>
      e.displayObject.destroy()
    );
  }

  private ballRefere: UIGameObject | undefined = undefined;
  public getObjectByTag(tag: string): UIGameObject | undefined {
    if (tag === PongModel.InGame.ObjType.Ball && !!this.ballRefere)
      return this.ballRefere;
    const obj = this.gameObjects.find(
      (gameObject: GameObject) => gameObject.tag === tag
    ) as UIGameObject;
    if (!this.ballRefere && obj instanceof Ball) this.ballRefere = obj;
    return obj;
  }

  shutdown() {
    this.gameObjects.forEach((e) => this.remove_gameObjects.push(e));
    this.removeObjects();
    this.app.stage.destroy();
    this.app.stop();
    this.app.destroy(true, { children: true });
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    super.shutdown();
  }

  private drawPlayers(gameConfig: PongModel.Models.IGameConfig) {
    const players = gameConfig.teams[0].players.concat(
      gameConfig.teams[1].players
    );
    const objtype = PongModel.InGame.ObjType;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      let startX;
      let playerNbr;
      if (p.positionOrder === 'back') {
        startX = P_START_DIST;
        p.teamId === 0
          ? (playerNbr = objtype.Player1)
          : (playerNbr = objtype.Player2);
      } else {
        startX = MULTIPLAYER_START_POS;
        p.teamId === 0
          ? (playerNbr = objtype.Player3)
          : (playerNbr = objtype.Player4);
      }
      let direction;
      if (p.teamId === 1) {
        startX = this.width - startX;
        direction = new Vector2D(-1, 1);
      } else {
        direction = new Vector2D(1, 1);
      }

      if (p.type === 'player') {
        this.add(
          new UIPlayer(
            startX,
            this.height / 2,
            p.keys!,
            playerNbr!,
            direction,
            p.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
            this,
            p.teamId,
            p.paddle as keyof typeof paddleConfig,
            p.avatar,
            p.nickname,
            p.userId
          )
        );
      } else {
        this.add(
          new UIBot(
            startX,
            this.height / 2,
            playerNbr!,
            direction,
            p.specialPower as PongModel.Models.LobbyParticipantSpecialPowerType,
            this,
            p.teamId,
            p.paddle as keyof typeof paddleConfig,
            p.avatar,
            p.nickname,
            p.userId
          )
        );
      }
    }
  }
}
