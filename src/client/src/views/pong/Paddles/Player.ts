import * as PIXI from 'pixi.js';
import { Vector2D } from '../utils/Vector';
import { UIGame } from '../Game';
import { UIMana } from './Mana';
import { UIEnergy } from './Energy';
import { UIShooter } from '../SpecialPowers/Shooter';
import { Player } from '@shared/Pong/Paddles/Player';
import { UIBar } from './Bar';
import { UIEffect } from '../SpecialPowers/Effect';
import { UIGameObject } from '../GameObject';
import PongModel from '@typings/models/pong';

export interface KeyControls {
  up: string;
  down: string;
  boost: string;
  shoot: string;
}

/* ------------------- Player ------------------- */

export class UIPlayer extends Player {
  public displayObject: PIXI.Sprite;

  public mana: UIMana;
  public energy: UIEnergy;
  public shooter: UIShooter | undefined;
  public effect: UIEffect | undefined;

  constructor(
    texture: PIXI.Texture,
    x: number,
    y: number,
    public keys: KeyControls,
    tag: string,
    public direction: Vector2D,
    public specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    private uigame: UIGame
  ) {
    super(x, y, keys, tag, direction, specialPower, uigame);
    this.displayObject = new PIXI.Sprite(texture);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
    this.scale = 1;
    this.mana = new UIMana(tag, uigame);
    this.energy = new UIEnergy(tag, uigame);
    this.shooter = undefined;
    this.effect = undefined;

    // add listeners for mana and energy updates    
  }

  updateEffect(effectName: string, effectValue: number): void {
    console.log(effectName + " " + effectValue);
    if (this.effect === undefined) {
      this.effect = new UIEffect(effectName, this);
      if (effectName === "INVISIBLE") {
        this.displayObject.alpha = 0;
      }
    } else {
      this.effect.update(effectValue, this);
    }
  }

  updateShooter(line: {start: number[], end: number[]}): void {
    if (this.shooter !== undefined) {
      this.shooter.draw(line);
      this.displayObject.y = this.uigame.height / 2;
    }
  }

  shootPower(): void {
    if (this.shooter !== undefined) {
      this.shooter.shootBall(this);
      this.uigame.app.stage.removeChild(this.shooter?.displayObject);
    }
  }

  setScaleDisplayObject(scale: number): void {
    this.displayObject.height = this.height * scale;
    this.displayObject.width = this.width;
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
    return UIBar.create(specialPower, center, direction, shooter, powertag);
  }

  setScaleDisplay(scale: number): void {
    this.setScale(scale);
    this.setScaleDisplayObject(this.scale);
    this.setDisplayObjectCoords(this.center);
  }

  update(): void {
  }
}
