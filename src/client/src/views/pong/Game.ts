import * as PIXI from 'pixi.js';
import { UIBall } from './Ball';
import { Game } from '@shared/Pong/Game';
import { UIGameObject } from './GameObject';
import { Vector2D } from './utils/Vector';
import { UIArenaWall } from './Collisions/Arena';
import { Debug } from './utils/Debug';
import { drawLines } from './utils/drawUtils';
import { UIPlayer } from './Paddles/Player';
import {
  hue_value,
  P_START_DIST,
  ARENA_SIZE,
  P1Tex,
  P2Tex,
  BallTex,
} from './utils';
import { ETeamSide, IGameConfig } from '@shared/Pong/config/configInterface';
import { SpecialPowerType } from '@shared/Pong/SpecialPowers/SpecialPower';
import {
  MULTIPLAYER_START_POS,
  WINDOWSIZE_X,
  WINDOWSIZE_Y,
} from '@shared/Pong/main';

import { UIBot } from './Paddles/Bot';
import { Socket } from 'socket.io-client';
import { GameObject, effectSendOption } from '@shared/Pong/GameObject';
import { UIBubble } from './SpecialPowers/Bubble';
import { UIFire } from './SpecialPowers/Fire';
import { UIGhost } from './SpecialPowers/Ghost';
import { UIIce } from './SpecialPowers/Ice';
import { UISpark } from './SpecialPowers/Spark';
import { UIEffect } from './SpecialPowers/Effect';
import PongModel from '@typings/models/pong';

type Powers = UIBubble | UIFire | UIGhost | UIIce | UISpark;

export class UIGame extends Game {
  public app: PIXI.Application;
  public debug: Debug;
  private scoreElement: PIXI.Text;
  private scoreStyle: PIXI.TextStyle;

  private blueTranform = new PIXI.ColorMatrixFilter();
  private backgroundHue = new PIXI.ColorMatrixFilter();

  public roomId: string;

  constructor(
    public readonly socket: Socket,
    container: HTMLDivElement,
    gameConfig: PongModel.Models.IGameConfig
  ) {
    super(WINDOWSIZE_X, WINDOWSIZE_Y);

    this.roomId = gameConfig.UUID;

    // need to add background tex
    // Black hardcoded for now
    this.app = new PIXI.Application({
      background: "#000000",
      antialias: true, // smooth edge rendering
      width: WINDOWSIZE_X,
      height: WINDOWSIZE_Y,
    });
    this.app.renderer.background.color = "#000000";

    drawLines(0xFFFFFF, this.app);

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
    this.add(new UIBall(this.width / 2, this.height / 2, BallTex, this));

    container.appendChild(this.app.view as HTMLCanvasElement);

    // change this
    this.scoreStyle = new PIXI.TextStyle({
      fontFamily: 'arial',
      fontSize: 36,
      fontWeight: 'bold',
      fill: ['#FF2C05', '#FFCE03'], // gradient
      stroke: '#4a1850',
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 3,
      dropShadowAngle: Math.PI / 4,
      dropShadowDistance: 2,
    });
    this.scoreElement = new PIXI.Text(
      `${this.score[0]}     ${this.score[1]}`,
      this.scoreStyle
    );
    this.scoreElement.x = this.app.view.width / 2 - this.scoreElement.width / 2;
    this.scoreElement.y = this.app.view.height / 16;
    this.app.stage.addChild(this.scoreElement);

    //window.addEventListener('resize', this.setCanvasSize.bind(this));
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    this.debug = new Debug(this.app);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key && e.repeat === false && e.shiftKey === false) {
      this.socket.emit('keyPress', {
        key: e.key.toLowerCase(),
        state: true,
      });
    }
    if (e.key === 'p') this.debug.isDebug = !this.debug.isDebug;
  };

  handleKeyUp = (e: KeyboardEvent) => {
    this.socket.emit('keyPress', {
      key: e.key.toLowerCase(),
      state: false,
    });
  };

  handleMovements(data: { tag: string; position: number[] }[]) {
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
    if (obj.tag.includes('Bubble')) return obj as UIBubble;
    if (obj.tag.includes('Fire')) return obj as UIFire;
    if (obj.tag.includes('Ghost')) return obj as UIGhost;
    if (obj.tag.includes('Ice')) return obj as UIIce;
    if (obj.tag.includes('Spark')) return obj as UISpark;
    return undefined;
  }

  // specialpower.removePower() is a handler for the collision, it's data is erased here
  handleRemovePower(obj: UIGameObject) {
    const specialpower = this.getObjectWithType(obj);
    if (specialpower) {
      specialpower.removePower();
      specialpower.displayObject?.destroy();
      this.app.stage.removeChild(specialpower.displayObject);
    }
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

  start() {
    const text = new PIXI.Text(this.app.ticker.FPS, { fill: 'white' });
    text.x = 200;
    text.y = 10;
    this.app.stage.addChild(text);
    this.app.ticker.add(this.update.bind(this));
  }

  // ERROR HERE 
  updateScore(teamId: number, updatedScore: [number, number], scale: number) {
    this.score = updatedScore;
    this.scoreElement.text = `${this.score[0]}     ${this.score[1]}`;
    if (teamId === ETeamSide.Left && scale > 0.82) {
      const p1 = this.getObjectByTag('Player 1');
      (p1 as UIPlayer).setScaleDisplay(scale);
      const p3 = this.getObjectByTag('Player 3');
      if (p3) (p3 as UIPlayer).setScaleDisplay(scale);
    } else if (teamId === ETeamSide.Right && scale > 0.82) {
      const p2 = this.getObjectByTag('Player 2');
      (p2 as UIPlayer).setScaleDisplay(scale);
      const p4 = this.getObjectByTag('Player 4');
      if (p4) (p4 as UIPlayer).setScaleDisplay(scale);
    }
  }

  update() {
    if (this.run) {
      this.scoreElement.text = `${this.score[0]}     ${this.score[1]}`;
      this.backgroundHue.hue(hue_value, false);
      //hue_value += 1;
      this.debug.debugDraw(this.gameObjects as UIGameObject[]);
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

  public getObjectByTag(tag: string): UIGameObject | undefined {
    return this.gameObjects.find(
      (gameObject: GameObject) => gameObject.tag === tag
    ) as UIGameObject;
  }

  shutdown() {
    this.gameObjects.forEach((e) => this.remove_gameObjects.push(e));
    this.removeObjects();
    this.app.stage.destroy();
    this.app.stop();
    this.app.destroy(true);
    super.shutdown();
  }

  private drawPlayers(gameConfig: PongModel.Models.IGameConfig) {
    const p1Conf = gameConfig.teams[0].players[0];
    const p2Conf = gameConfig.teams[1].players[0];

    // Texture cannot be "P1Tex", it might need to be pre-loaded on the client side
    // Add special power to the bots
    let p1;
    if (p1Conf.type === 'player') {
      p1 = new UIPlayer(
        P1Tex,
        P_START_DIST,
        this.height / 2,
        p1Conf.keys!,
        'Player 1', // might need to be changed
        new Vector2D(1, 1),
        p1Conf.specialPower as SpecialPowerType,
        this
      );
    } else {
      p1 = new UIBot(
        P1Tex,
        P_START_DIST,
        this.height / 2,
        'Player 2',
        new Vector2D(1, 1),
        this
      );
    }
    // modify the color of the player based on gameConfig
    this.blueTranform.hue(240, false);
    p1.displayObject.filters = [this.blueTranform];
    this.add(p1);

    let p2;
    if (p2Conf.type === 'player') {
      p2 = new UIPlayer(
        P2Tex,
        this.width - P_START_DIST,
        this.height / 2,
        p2Conf.keys!,
        'Player 2',
        new Vector2D(-1, 1),
        p2Conf.specialPower as SpecialPowerType,
        this
      );
    } else {
      p2 = new UIBot(
        P2Tex,
        this.width - P_START_DIST,
        this.height / 2,
        'Player 2',
        new Vector2D(-1, 1),
        this
      );
    }
    // modify the color of the player based on gameConfig
    this.add(p2);

    if (gameConfig.teams[0].players.length > 1) {
      const p3Conf = gameConfig.teams[0].players[1];
      let p3;
      if (p3Conf.type === 'player') {
        p3 = new UIPlayer(
          P1Tex,
          MULTIPLAYER_START_POS,
          this.height / 2,
          p3Conf.keys!,
          'Player 3',
          new Vector2D(1, 1),
          p3Conf.specialPower as SpecialPowerType,
          this
        );
      } else {
        p3 = new UIBot(
          P1Tex,
          MULTIPLAYER_START_POS,
          this.height / 2,
          'Player 3',
          new Vector2D(1, 1),
          this
        );
      }
      // modify the color of the player based on gameConfig
      this.blueTranform.hue(240, false);
      p3.displayObject.filters = [this.blueTranform];
      this.add(p3);
    }

    if (gameConfig.teams[1].players.length > 1) {
      const p4Conf = gameConfig.teams[1].players[1];
      let p4;
      if (p4Conf.type === 'player') {
        p4 = new UIPlayer(
          P2Tex,
          this.width - MULTIPLAYER_START_POS,
          this.height / 2,
          p4Conf.keys!,
          'Player 4',
          new Vector2D(-1, 1),
          p4Conf.specialPower as SpecialPowerType,
          this
        );
      } else {
        p4 = new UIBot(
          P2Tex,
          this.width - MULTIPLAYER_START_POS,
          this.height / 2,
          'Player 4',
          new Vector2D(-1, 1),
          this
        );
      }
      // modify the color of the player based on gameConfig
      this.add(p4);
    }
  }
}
