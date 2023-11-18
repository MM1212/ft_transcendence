import { UIGameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { CannonTex } from "../index";
import { Bar } from "@shared/Pong/Paddles/Bar";
import { UIShooter } from "./Shooter";
import * as PIXI from "pixi.js";
import { UIGame } from "../Game";
import { Fire } from "@shared/Pong/SpecialPowers/Fire";

enum collide {
  NO,
  YES_REMOVE,
  YES_SHOOT,
}

export class UIFire extends Fire {
  public displayObject: PIXI.AnimatedSprite;
  //public displayObject: PIXI.Sprite;
  constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
    super(center, velocity, shooter);

    this.displayObject = new PIXI.Sprite(CannonTex) as PIXI.AnimatedSprite;
    //FireAnim.then((textures) => {
    //  this.displayObject.destroy();
    //  this.displayObject = new PIXI.AnimatedSprite(textures);
    //  (this.game as UIGame).app.stage.addChild(this.displayObject);
    //  this.setupAsset(this.center);
    //  this.displayObject.animationSpeed = 0.1;
    //  this.displayObject.play();
    //});
    this.setupAsset(center);
  }
  setupAsset(center: Vector2D) {
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = center.x;
    this.displayObject.y = center.y;
  }

  update(delta: number): boolean {
    if (!super.update(delta)) {
      return false;
    }

    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
    return true;
  }

  onCollide(target: UIGameObject): boolean {
    const ret = super.onCollide(target) as collide;
    if (ret === collide.YES_SHOOT) {
      this.shooter.setShooter(new UIShooter(this.shooter, this.game as UIGame));
      this.game.remove(this);
    } else if (ret === collide.YES_REMOVE) {
      this.game.remove(this);
    }

    return ret !== collide.NO;
  }
}
