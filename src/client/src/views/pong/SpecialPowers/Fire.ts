import { Vector2D } from '../utils/Vector';
import { FireballDies, FireballWalk } from '../utils';
import { Bar } from '@shared/Pong/Paddles/Bar';
import * as PIXI from 'pixi.js';
import { UIGame } from '../Game';
import { Fire } from '@shared/Pong/SpecialPowers/Fire';

export class UIFire extends Fire {
  public displayObject: PIXI.AnimatedSprite;
  public tempOnCollideAnimation: PIXI.AnimatedSprite | undefined;

  constructor(
    center: Vector2D,
    velocity: Vector2D,
    public shooter: Bar,
    tag: string,
    private uigame: UIGame
  ) {
    super(center, velocity, shooter);
    this.displayObject = new PIXI.AnimatedSprite(FireballWalk);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = center.x;
    this.displayObject.y = center.y;
    this.displayObject.animationSpeed = 0.1;
    this.displayObject.scale.set(shooter.direction.x === 1 ? -1 : 1, 1);
    this.displayObject.play();
    this.tempOnCollideAnimation = undefined;


    this.tag = tag;
  }

  update(): void {
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
  }

  removePower(): void {
    this.tempOnCollideAnimation = new PIXI.AnimatedSprite(FireballDies);
    this.tempOnCollideAnimation.anchor.set(0.5);
    this.tempOnCollideAnimation.x = this.center.x;
    this.tempOnCollideAnimation.y = this.center.y;
    this.tempOnCollideAnimation.animationSpeed = 0.5;
    this.tempOnCollideAnimation.scale.set(
      this.shooter.direction.x === 1 ? -1 : 1,
      1
      );
    this.tempOnCollideAnimation.visible = false;
    this.uigame.app.stage.addChild(this.tempOnCollideAnimation);
    this.tempOnCollideAnimation.visible = true;
    this.tempOnCollideAnimation.x = this.center.x;
    this.tempOnCollideAnimation.y = this.center.y;
    this.tempOnCollideAnimation.play();
    this.tempOnCollideAnimation.onLoop = () => {
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
