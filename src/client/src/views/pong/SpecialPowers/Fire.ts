import { Vector2D } from '../utils/Vector';
import { AnimationConstructor } from '../utils';
import { Bar } from '@shared/Pong/Paddles/Bar';
import * as PIXI from 'pixi.js';
import { UIGame } from '../Game';
import { Fire } from '@shared/Pong/SpecialPowers/Fire';
import PongModel from '@typings/models/pong';

export class UIFire extends Fire {
  public displayObject: PIXI.AnimatedSprite | PIXI.Sprite;
  public tempOnCollideAnimation: PIXI.AnimatedSprite | PIXI.Sprite | undefined;

  constructor(
    center: Vector2D,
    velocity: Vector2D,
    public shooter: Bar,
    tag: string,
    private uigame: UIGame
  ) {
    super(center, velocity, shooter);
    this.displayObject = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.tempOnCollideAnimation = new PIXI.Sprite(PIXI.Texture.EMPTY);
    AnimationConstructor(
      {
        path: `${PongModel.Endpoints.Targets.FireballWalk}/FireballWalk`,
        json: `${PongModel.Endpoints.Targets.FireballWalkJSON}`,
        frames: 5,
      },
      {
        path: `${PongModel.Endpoints.Targets.FireballDies}/FireballDies`,
        json: `${PongModel.Endpoints.Targets.FireballDiesJSON}`,
        frames: 3,
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
      this.tempOnCollideAnimation.x = this.center.x;
      this.tempOnCollideAnimation.y = this.center.y;
      (this.tempOnCollideAnimation as PIXI.AnimatedSprite).animationSpeed = 0.5;
      this.tempOnCollideAnimation.scale.set(
        this.shooter.direction.x === 1 ? -1 : 1,
        1
      );
      this.tempOnCollideAnimation.visible = false;
      this.uigame.app.stage.addChild(this.tempOnCollideAnimation);
    });
    this.tag = tag;
  }

  update(): void {
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
  }

  removePower(): void {
    if (!this.tempOnCollideAnimation) return;
    this.tempOnCollideAnimation.visible = true;
    this.tempOnCollideAnimation.x = this.center.x;
    this.tempOnCollideAnimation.y = this.center.y;
    (this.tempOnCollideAnimation as PIXI.AnimatedSprite).play();
    (this.tempOnCollideAnimation as PIXI.AnimatedSprite).onLoop = () => {
      this.tempOnCollideAnimation!.destroy();
      this.uigame.app.stage.removeChild(this.tempOnCollideAnimation!);
    };
  }

  onCollide() {}

  //onCollide(target: UIGameObject): boolean {
  //  const ret = super.onCollide(target) as collide;
  //  if (ret === collide.YES_SHOOT) {
  //    this.shooter.setShooter(new UIShooter(this.shooter, this.game as UIGame));
  //    this.game.remove(this);
  //  } else if (ret === collide.YES_REMOVE) {
  //    this.game.remove(this);
  //  }
  //
  //  return ret !== collide.NO;
  //}
}
