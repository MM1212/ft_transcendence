import * as PIXI from 'pixi.js';
import { Vector2D } from '../utils/Vector';
import { UIGame } from '../Game';
import { UIMana } from './Mana';
import { UIEnergy } from './Energy';
import { UIShooter } from '../SpecialPowers/Shooter';
import { Player } from '@shared/Pong/Paddles/Player';
import { UIBar } from './Bar';
import { UIEffect } from '../SpecialPowers/Effect';
import PongModel from '@typings/models/pong';
import { paddleConfig } from '@shared/Pong/config/configInterface';
import { buildTexture } from '../utils';
import { computeUserAvatar } from '@utils/computeAvatar';
import { ARENA_SIZE } from '@shared/Pong/main';
import Display from './Display';

export interface KeyControls {
  up: string;
  down: string;
  boost: string;
  shoot: string;
}

/* ------------------- Player ------------------- */

export class UIPlayer extends Player {
  public displayObject: PIXI.Sprite;

  public shooter: UIShooter | undefined;
  public effect: UIEffect | undefined;
  public display: Display;

  constructor(
    x: number,
    y: number,
    public keys: KeyControls,
    tag: string,
    public direction: Vector2D,
    public specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    private uigame: UIGame,
    teamId: number,
    paddle: keyof typeof paddleConfig,
    avatar: string,
    public nickname: string,
    public userId: number
  ) {
    super(x, y, keys, tag, direction, specialPower, uigame, teamId, paddle);

    const tex = buildTexture(
      `${PongModel.Endpoints.Targets.Paddles}/${paddle}.webp`
    );

    this.displayObject = new PIXI.Sprite(tex);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
    this.scale = 1;
    this.shooter = undefined;
    this.effect = undefined;
    this.display = new Display(nickname, avatar, uigame, tag);
  }

  updateEffect(effectName: string, effectValue: number): void {
    if (this.effect === undefined) {
      this.effect = new UIEffect(effectName, this);
      if (effectName === 'INVISIBLE') {
        this.displayObject.alpha = 0;
      }
    } else {
      this.effect.update(effectValue, this);
    }
  }

  updateShooter(line: { start: number[]; end: number[] }): void {
    if (this.shooter !== undefined) {
      this.shooter.draw(line);
      this.displayObject.y = this.uigame.height / 2;
    }
  }

  shootPower(): void {
    if (this.shooter !== undefined) {
      this.shooter.shootBall(this);
    }
  }

  setDisplayObjectCoords(center: Vector2D): void {
    this.displayObject.x = center.x;
    this.displayObject.y = center.y;
  }

  createPower(
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    center: Vector2D,
    direction: number,
    shooter: UIBar,
    powertag: string
  ) {
    return UIBar.create(
      specialPower,
      center,
      direction,
      shooter,
      powertag,
      this.uigame
    );
  }

  setScaleDisplay(
    scale: number,
    height: number,
    width: number,
    x: number,
    y: number
  ): void {
    this.scale = scale;
    this.height = height;
    this.width = width;
    this.center.y = y;
    this.center.x = x;
    this.displayObject.height = height;
    this.displayObject.width = width;
    this.displayObject.x = x;
    this.displayObject.y = y;
    if (this.collider === undefined) return;
    this.collider.height = height;
    this.collider.width = width;
    this.updatePolygon(this.center);
  }

  update(): void {}
}
