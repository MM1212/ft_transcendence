import { Bar } from "./Bar";
import { Vector2D } from "../utils/Vector";
import { SpecialPower } from "../SpecialPowers/SpecialPower";
import { Game } from "../Game";
import { GameObject } from "../GameObject";
import PongModel from "../../../typings/models/pong";
import { paddleConfig, specialpowerConfig } from "../config/configInterface";

/* ----------------- Velocity ----------------- */
const UP = new Vector2D(0, -5);
const DOWN = new Vector2D(0, 5);
const STOP = new Vector2D(0, 0);

/* ------------------- Keys ------------------- */
interface KeyState {
  [key: string]: boolean;
}
export interface KeyControls {
  up: string;
  down: string;
  boost: string;
  shoot: string;
}

export enum SHOOT_ACTION {
  NONE,
  CREATE,
  SHOOT,
}

/* ------------------- Player ------------------- */
export class Player extends Bar {
  public keyPressed: KeyState = {
    up: false,
    down: false,
    boost: false,
    shoot: false,
  };
  public keyJustPressed: KeyState = {
    up: false,
    down: false,
    boost: false,
    shoot: false,
  };

  constructor(
    x: number,
    y: number,
    public keys: KeyControls,
    public tag: string,
    public direction: Vector2D,
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    game: Game,
    public teamId: number,
    paddle: keyof typeof paddleConfig,
    public readonly userId?: number,
  ) {
    super(x, y, tag, direction, game, paddle);
    this.specialPowerType = specialPower;
    this.stats.setPowerCost(specialpowerConfig[specialPower].manaCost);
  }

  onKeyDown(key: string): void {
    this.keyPressed[key] = true;
  }

  onKeyUp(key: string): void {
    if (this.keyPressed[key]) this.keyJustPressed[key] = true;
    this.keyPressed[key] = false;
  }

  public handleShoot(): [number, string] {
    if (
      this.game.gamemode === PongModel.Models.LobbyGameType.Powers &&
      this.keyJustPressed[this.keys.shoot]
    ) {
      if (
        this.isShooting === false &&
        this.shooter === undefined &&
        this.hasEnoughMana()
      ) {
        this.power = this.createPower(
          this.specialPowerType,
          this.center,
          this.direction.x,
          this,
          ""
        );
        if (this.power !== undefined) {
          this.game.add(this.power);
          return [SHOOT_ACTION.CREATE, this.power.tag];
        }
      } else if (this.isShooting === true) {
        this.shooter?.shootBall(this);
        return [SHOOT_ACTION.SHOOT, ""];
      }
    }
    return [SHOOT_ACTION.NONE, ""];
  }

  protected createPower(
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    center: Vector2D,
    direction: number,
    shooter: Bar,
    tag: string
  ) {
    return Bar.create(specialPower, center, direction, shooter, tag);
  }

  executeMovement(): void {
    if (this.keyPressed[this.keys.up]) {
      this.setMove(true);
      this.setVelocity(UP.multiply(this.effectVelocity));
    } else if (this.keyPressed[this.keys.down]) {
      this.setMove(true);
      this.setVelocity(DOWN.multiply(this.effectVelocity));
    } else {
      this.setMove(false);
      this.setVelocity(STOP);
    }
    if (this.keyPressed[this.keys.boost]) {
      if (this.energy.energy > 2 && this.move) {
        this.setAcceleration(2);
        this.energy.spendEnergy(2 * this.game.delta);
      }
    } else {
      this.setAcceleration(1);
    }
  }

  update(delta: number): void {
    this.hasChanged = false;
    if (this.isShooting === false) {
      this.executeMovement();
    }

    if (this.move && this.checkArenaCollision()) {
      this.center.y += this.move
        ? this.velocity.y * this.acceleration * delta
        : 0;
      this.updatePolygon(this.center);
      this.hasChanged = true;
    }
    if (this.game.gamemode === PongModel.Models.LobbyGameType.Powers) {
      this.mana.update(this.tag, delta);

      if (this.effect !== undefined) {
        this.effect.update(delta, this);
      }
      if (this.shooter !== undefined) {
        this.shooter.update(delta, this);
      }
    }

    this.energy.update(this.tag, delta);

    if (this.energy.energy <= 2) {
      this.keyPressed[this.keys.boost] = false;
    }

    this.keyJustPressed = {
      up: false,
      down: false,
      boost: false,
      shoot: false,
    };
  }
}
