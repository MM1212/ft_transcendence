import { GameObject } from '../GameObject';
import { BarPolygon } from '../Collisions/Polygon';
import { Vector2D } from '../utils/Vector';
import { Mana } from './Mana';
import { Energy } from './Energy';
import { SpecialPower } from '../SpecialPowers/SpecialPower';
import { Shooter } from '../SpecialPowers/Shooter';

import { Bubble } from '../SpecialPowers/Bubble';
import { Ice } from '../SpecialPowers/Ice';
import { Fire } from '../SpecialPowers/Fire';
import { Spark } from '../SpecialPowers/Spark';
import { Ghost } from '../SpecialPowers/Ghost';

import {
  gameConfig,
  paddleConfig,
  specialpowerConfig,
} from '../config/configInterface';
import { Game } from '../Game';

import PongModel from '../../../typings/models/pong/index';
import { Collider } from '../Collisions/Collider';
import { BarStatistics } from '../Stats/BarStats';

export abstract class Bar extends GameObject {
  public mana: Mana;
  public energy: Energy;

  public specialPowerType: PongModel.Models.LobbyParticipantSpecialPowerType;

  public teamId: number = 0;

  public power: SpecialPower | undefined = undefined;
  public scored: number = 0;

  public shooter: Shooter | undefined = undefined;
  protected isShooting: boolean = false;

  public stats: BarStatistics;

  constructor(
    x: number,
    y: number,
    tag: string,
    public direction: Vector2D,
    game: Game,
    paddle: keyof typeof paddleConfig
  ) {
    super(tag, game);

    this._move = false;
    this.acceleration = 1;
    this.center = new Vector2D(x, y);
    this.velocity = Vector2D.Zero;
    this.direction = direction;
    this.scale = 1;
    this.height = paddleConfig[paddle].height;
    this.width = paddleConfig[paddle].width;
    this.specialPowerType =
      PongModel.Models.LobbyParticipantSpecialPowerType.none;
    this.collider = Collider.fromPolygon(
      new BarPolygon(this.center, this.width, this.height, this.direction)
    );
    this.mana = new Mana();
    this.energy = new Energy();
    this.effect = undefined;
    this.shooter = undefined;
    this.stats = new BarStatistics(
      specialpowerConfig[this.specialPowerType].manaCost
    );
  }

  get HeightVal(): number {
    return this.height;
  }
  get WidthVal(): number {
    return this.width;
  }

  get manaBar(): Mana {
    return this.mana;
  }
  setShooter(shooter: Shooter | undefined): void {
    if (shooter !== undefined) {
      this.shooter = shooter;
      this.hasChangedShooter = true;
      this.isShooting = true;
    } else {
      this.isShooting = false;
      this.hasChangedShooter = false;
      this.shooter = undefined;
    }
  }
  get shooting(): boolean {
    return this.isShooting;
  }

  reduceScale(): void {
    if (this.getScale >= 0.82) {
      this.setScale(this.getScale - 0.02);
      this.game.sendPaddlesScale.push(this);
    }
  }

  setScale(scale: number): void {
    this.scale = scale;
    this.height = this.height * scale;
    this.width = this.width * scale;
    this.updatePolygon(this.center);
  }

  updatePolygon(center: Vector2D): void {
    if (this.collider === undefined) return;
    this.collider.polygon.width = this.width;
    this.collider.polygon.height = this.height;
    this.collider.polygon.update(center);
    this.collider.updateBoundingBox();
  }

  abstract update(delta: number): void;

  checkArenaCollision(): boolean {
    if (this.collider?.line && this.collider.intersection) {
      if (
        this.collider.intersection.y < this.getCenter.y &&
        this.velocity.y < 0
      )
        return false;
      if (
        this.collider.intersection.y > this.getCenter.y &&
        this.velocity.y > 0
      )
        return false;
    }
    return true;
  }

  public static create(
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    center: Vector2D,
    direction: number,
    shooter: Bar,
    tag: string
  ) {
    shooter.stats.shotFired();
    switch (specialPower) {
      case PongModel.Models.LobbyParticipantSpecialPowerType.bubble:
        return new Bubble(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.ice:
        return new Ice(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.fire:
        return new Fire(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.spark:
        return new Spark(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter
        );
      case PongModel.Models.LobbyParticipantSpecialPowerType.ghost:
        return new Ghost(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter
        );
    }
  }

  hasEnoughMana(): boolean {
    switch (this.specialPowerType) {
      case PongModel.Models.LobbyParticipantSpecialPowerType.bubble:
        return this.manaBar.isManaEnough(specialpowerConfig.bubble.manaCost);
      case PongModel.Models.LobbyParticipantSpecialPowerType.fire:
        return this.manaBar.isManaEnough(specialpowerConfig.fire.manaCost);
      case PongModel.Models.LobbyParticipantSpecialPowerType.ice:
        return this.manaBar.isManaEnough(specialpowerConfig.ice.manaCost);
      case PongModel.Models.LobbyParticipantSpecialPowerType.spark:
        return this.manaBar.isManaEnough(specialpowerConfig.spark.manaCost);
      case PongModel.Models.LobbyParticipantSpecialPowerType.ghost:
        return this.manaBar.isManaEnough(specialpowerConfig.ghost.manaCost);
      default:
        return false;
    }
  }
}
