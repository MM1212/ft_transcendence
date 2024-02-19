import { UIGame } from "../Game";
import * as PIXI from 'pixi.js';
import { Shooter } from "@shared/Pong/SpecialPowers/Shooter";
import { Bar } from "@shared/Pong/Paddles/Bar";
import { UIBar } from "../Paddles/Bar";
import { ShooterAim } from "../utils";

export class UIShooter extends Shooter {
  public displayObject: PIXI.Graphics;

  public shooterDisplay: PIXI.AnimatedSprite;

  constructor(shooter: Bar, private uigame: UIGame) {
    super(shooter, uigame);
    this.displayObject = new PIXI.Graphics();
    this.displayObject.clear();
    this.displayObject.zIndex = 1;
    this.uigame.app.stage.addChild(this.displayObject);

    this.shooterDisplay = new PIXI.AnimatedSprite(ShooterAim);
    this.shooterDisplay.anchor.set(0.5);
    this.shooterDisplay.animationSpeed = 0.1;
    this.shooterDisplay.visible = true;
    this.shooterDisplay.play();
    this.uigame.app.stage.addChild(this.shooterDisplay);
  }

  draw(line: { start: number[]; end: number[] }): void {
    this.displayObject.clear();
    this.shooterDisplay.x = line.start[0];
    this.shooterDisplay.y = line.start[1];
    this.displayObject.lineStyle(4, 0xff0000, 1);
    this.displayObject.moveTo(line.start[0], line.start[1]);
    this.displayObject.lineTo(line.end[0], line.end[1]);
  }

  erase(): void {
    if (this.displayObject) {
      this.displayObject.clear();
      this.uigame.app.stage.removeChild(this.displayObject);
    }
    if (this.shooterDisplay) {
      this.shooterDisplay.destroy();
      this.uigame.app.stage.removeChild(this.shooterDisplay);
    }
  }

  shootBall(shooter: UIBar): void {
    if (this.displayObject) {
        this.displayObject.clear();
        this.uigame.app.stage.removeChild(this.displayObject);
    }
    if (this.shooterDisplay) {
        this.shooterDisplay.destroy();
        this.uigame.app.stage.removeChild(this.shooterDisplay);
    }
    shooter.setShooter(undefined);
  }

  update(): boolean {
    return true;
  }
}
