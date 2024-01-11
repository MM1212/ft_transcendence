import { GameObject } from '../GameObject';
import { Vector2D } from '../utils/Vector';
import { specialpowerConfig } from '../config/configInterface';
import { SpecialPower } from './SpecialPower';
import { Effect } from './Effect';
import { Ball } from '../Ball';
import { Bar } from '../Paddles/Bar';
import { Shooter } from './Shooter';
import PongModel from "../../../typings/models/pong";

enum collide {
  NO,
  YES_REMOVE,
  YES_SHOOT,
}
export class Fire extends SpecialPower {
  constructor(center: Vector2D, velocity: Vector2D, public shooter: Bar) {
    super(
      PongModel.Models.LobbyParticipantSpecialPowerType.fire,
      center,
      velocity,
      shooter,
      specialpowerConfig.fire.diameter,
      specialpowerConfig.fire.vertices
    );
    this.tag += this.id;
    shooter.manaBar.spendMana(this.manaCost);
  }

  get manaCost(): number {
    return specialpowerConfig.fire.manaCost;
  }

  onCollide(target: GameObject): any {
    if (target instanceof Ball) {
      this.shooter.stats.iHitMyPower(undefined);
      if (
        target.getEffect === undefined ||
        target.getEffect.name !== 'CANNON'
      ) {
        target.setEffect(new Effect('CANNON', target));
        this.shooter.setShooter(new Shooter(this.shooter, this.game));
        this.game.remove(this);
        return collide.YES_SHOOT;
      }
    }

    if (!(target instanceof SpecialPower)) {
      this.game.remove(this);
      return collide.YES_REMOVE;
    }
    return collide.NO;
  }
}
