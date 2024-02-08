import { Vector2D } from "../utils/Vector";
import { Game } from "../Game";
import { GameObject } from "../GameObject";
import { Bar } from "./Bar";
import PongModel from "../../../typings/models/pong";
import { paddleConfig, specialpowerConfig } from "../config/configInterface";

const UP = new Vector2D(0, -5);
const DOWN = new Vector2D(0, 5);
const STOP = new Vector2D(0, 0);

export class Bot extends Bar {
  private botSpeed: number = 5;

  private ballRef: GameObject | undefined;

  constructor(
    x: number,
    y: number,
    public tag: string,
    public direction: Vector2D,
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    game: Game,
    public teamId: number,
    paddle: keyof typeof paddleConfig,
    public readonly userId?: number
  ) {
    super(x, y, tag, direction, game, paddle);
    this.specialPowerType = specialPower;
    this.stats.setPowerCost(specialpowerConfig[specialPower].manaCost);
    this.ballRef = undefined;
  }

  getBallRef(): void {
    this.ballRef = this.game.getObjectByTag(PongModel.InGame.ObjType.Ball)!;
    if (!this.ballRef) throw new Error("Ball not found");
  }

  // add acceleration to the bot
  // add powers to the bot
  // add bot powers
  // add inteligent ball predicition to the bot
  // add bot difficulty:
  // add bot reaction time


  update(delta: number) {
    this.hasChanged = false;
    this.ballRef = this.game.getObjectByTag(PongModel.InGame.ObjType.Ball);
    if (!this.ballRef) return;
    if (
      (this.ballRef.getVelocity.x > 0 && this.direction.x < 0) ||
      (this.ballRef.getVelocity.x < 0 && this.direction.x > 0)
    ) {
      if (this.ballRef.getCenter.y < this.center.y - 5) {
        this.setMove(true);
        this.velocity = UP.multiply(this.effectVelocity);
      } else if (this.ballRef.getCenter.y > this.center.y + 5) {
        this.setMove(true);
        this.velocity = DOWN.multiply(this.effectVelocity);
      } else {
        this.setMove(false);
        this.velocity = STOP;
        this.hasChanged = true;
      }

      if (this.move && this.checkArenaCollision()) {
        this.center.y += this.velocity.y * this.acceleration * delta;
        this.updatePolygon(this.center);
        this.hasChanged = true;
      }

      this.mana.update(this.tag, delta);
      this.energy.update(this.tag, delta);

      if (this.effect !== undefined) {
        this.effect.update(delta, this);
      }
    }
  }

  onCollide(
    target: GameObject,
    line: { start: Vector2D; end: Vector2D }
  ): void {
  }
}
