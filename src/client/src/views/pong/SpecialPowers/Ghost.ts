import { Vector2D } from '../utils/Vector';
import { GhostDies, GhostWalk } from '../utils';
import { Bar } from '@shared/Pong/Paddles/Bar';
import * as PIXI from 'pixi.js';
import { Ghost } from '@shared/Pong/SpecialPowers/Ghost';
import type { UIPlayer } from '../Paddles/Player';
import type { UIBar } from '../Paddles/Bar';
import type { UIGame } from '../Game';

export class UIGhost extends Ghost {
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
    this.displayObject = new PIXI.AnimatedSprite(GhostWalk);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = center.x;
    this.displayObject.y = center.y;
    this.displayObject.animationSpeed = 0.1;
    this.displayObject.scale.set(shooter.direction.x === 1 ? -1 : 1, 1);
    this.displayObject.play();

    this.tempOnCollideAnimation = new PIXI.AnimatedSprite(GhostDies);
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
    return false;
  }
}
