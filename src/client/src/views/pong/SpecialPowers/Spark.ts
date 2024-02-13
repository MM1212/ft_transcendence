import { Vector2D } from '../utils/Vector';
import { AnimationConstructor } from '../utils';
import { Bar } from '@shared/Pong/Paddles/Bar';
import * as PIXI from 'pixi.js';
import { Spark } from '@shared/Pong/SpecialPowers/Spark';
import type { UIGame } from '../Game';
import PongModel from '@typings/models/pong';

export class UISpark extends Spark {
  public displayObject: PIXI.AnimatedSprite | PIXI.Sprite;
  public tempOnCollideAnimation: PIXI.AnimatedSprite | PIXI.Sprite;
  constructor(
    center: Vector2D,
    velocity: Vector2D,
    shooter: Bar,
    tag: string,
    private uigame: UIGame
  ) {
    super(center, velocity, shooter);

    this.displayObject = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.tempOnCollideAnimation = new PIXI.Sprite(PIXI.Texture.EMPTY);
    AnimationConstructor(
      {
        path: `${PongModel.Endpoints.Targets.SparkWalk}/SparkWalk`,
        json: `${PongModel.Endpoints.Targets.SparkWalkJSON}`,
        frames: 1,
      },
      {
        path: `${PongModel.Endpoints.Targets.SparkDies}/SparkDies`,
        json: `${PongModel.Endpoints.Targets.SparkDiesJSON}`,
        frames: 5,
      }
    ).then(([displayObject, tempOnCollideAnimation]) => {
      this.displayObject = displayObject;
      this.displayObject.anchor.set(0.5);
      this.displayObject.x = center.x;
      this.displayObject.y = center.y;
      (this.displayObject as PIXI.AnimatedSprite).animationSpeed = 0.1;
      this.displayObject.scale.set(shooter.direction.x === 1 ? -1 : 1, 1);
      (this.displayObject as PIXI.AnimatedSprite).play();
      this.uigame.app.stage.addChild(this.displayObject);
      if (!tempOnCollideAnimation) return;
      this.tempOnCollideAnimation = tempOnCollideAnimation;
      this.tempOnCollideAnimation.anchor.set(0.5);
      this.tempOnCollideAnimation.x = center.x;
      this.tempOnCollideAnimation.y = center.y;
      (this.tempOnCollideAnimation as PIXI.AnimatedSprite).animationSpeed = 0.5;
      this.tempOnCollideAnimation.scale.set(
        shooter.direction.x === 1 ? -1 : 1,
        1
      );
      this.tempOnCollideAnimation.visible = false;
      this.uigame.app.stage.addChild(this.tempOnCollideAnimation);
    });
    this.tag = tag;
  }

  update(): void {
    this.displayObject.rotation += 0.1;
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
  }

  removePower(): void {
    this.tempOnCollideAnimation.visible = true;
    this.tempOnCollideAnimation.x = this.center.x;
    this.tempOnCollideAnimation.y = this.center.y;
    (this.tempOnCollideAnimation as PIXI.AnimatedSprite).play();
    (this.tempOnCollideAnimation as PIXI.AnimatedSprite).onLoop = () => {
      this.tempOnCollideAnimation.destroy();
      this.uigame.app.stage.removeChild(this.tempOnCollideAnimation);
    };
  }

  onCollide(): boolean {
    return false;
  }
}
