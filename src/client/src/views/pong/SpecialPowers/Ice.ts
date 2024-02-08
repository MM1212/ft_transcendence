import { UIGameObject } from '../GameObject';
import { Vector2D } from '../utils/Vector';
import { IceDies, IceTex, IceWalk } from '../utils';
import { Bar } from '@shared/Pong/Paddles/Bar';
import * as PIXI from 'pixi.js';
import { Ice } from '@shared/Pong/SpecialPowers/Ice';
import { UIEffect } from './Effect';
import type { UIGame } from '../Game';

export class UIIce extends Ice {
  public displayObject: PIXI.AnimatedSprite;
  public tempOnCollideAnimation: PIXI.AnimatedSprite;
  constructor(
    center: Vector2D,
    velocity: Vector2D,
    shooter: Bar,
    tag: string,
    private uigame: UIGame
  ) {
    super(center, velocity, shooter);
    this.displayObject = new PIXI.AnimatedSprite(IceWalk);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = center.x;
    this.displayObject.y = center.y;
    this.displayObject.animationSpeed = 0.1;
    this.displayObject.scale.set(shooter.direction.x === 1 ? -1 : 1, 1);
    this.displayObject.play();

    this.tempOnCollideAnimation = new PIXI.AnimatedSprite(IceDies);
    this.tempOnCollideAnimation.anchor.set(0.5);
    this.tempOnCollideAnimation.x = center.x;
    this.tempOnCollideAnimation.y = center.y;
    this.tempOnCollideAnimation.animationSpeed = 0.5;
    this.tempOnCollideAnimation.scale.set(
      shooter.direction.x === 1 ? -1 : 1,
      1
    );
    this.tempOnCollideAnimation.visible = false;
    this.uigame.app.stage.addChild(this.tempOnCollideAnimation);

    this.tag = tag;
  }

  update(): void {
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
    this.displayObject.rotation += 0.1;
  }

  removePower(): void {
    this.tempOnCollideAnimation.visible = true;
    this.tempOnCollideAnimation.x = this.center.x;
    this.tempOnCollideAnimation.y = this.center.y;
    this.tempOnCollideAnimation.play();
    this.tempOnCollideAnimation.onLoop = () => {
      this.tempOnCollideAnimation.destroy();
      this.uigame.app.stage.removeChild(this.tempOnCollideAnimation);
    };
  }

  onCollide(): boolean {
    return true;
  }
}
