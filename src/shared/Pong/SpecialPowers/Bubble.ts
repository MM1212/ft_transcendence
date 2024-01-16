import { GameObject } from '../GameObject';
import { Vector2D } from '../utils/Vector';
import { SpecialPower } from './SpecialPower';
import { specialpowerConfig } from '../config/configInterface';
import { Bar } from '../Paddles/Bar';
import { Ball } from '../Ball';
import PongModel from '../../../typings/models/pong';

export class Bubble extends SpecialPower {
  constructor(center: Vector2D, velocity: Vector2D, public shooter: Bar) {
    super(
      PongModel.Models.LobbyParticipantSpecialPowerType.bubble,
      center,
      velocity,
      shooter,
      specialpowerConfig.bubble.diameter,
      specialpowerConfig.bubble.vertices
    );
    this.tag += this.id;
    shooter.manaBar.spendMana(this.manaCost);
    shooter.manaBar.manaStep = shooter.manaBar.mana;
  }

  get manaCost(): number {
    return specialpowerConfig.bubble.manaCost;
  }

  // add remove if out of map
  onCollide(target: GameObject): boolean {
    if (!(target instanceof SpecialPower)) {
      if (target instanceof Ball) {

        this.shooter.stats.iHitMyPower(undefined);

        const direction = this.getVelocity.x > 0 ? -1 : 1;
        const targetDirection = target.getVelocity.x > 0 ? -1 : 1;

        if (direction === targetDirection) {
          target.setVelocity(target.getVelocity.multiply(1.4));
        } else {
          let normalVec = new Vector2D(0, 1);
          if (target.getVelocity.y < 0) {
            normalVec = normalVec.multiply(-1);
          }

          const newVelocity = target.getVelocity.reflect(normalVec).multiply(-1);
          target.setVelocity(newVelocity);
        }
      }

      this.game.remove(this);
      return true;
    }
    return false;
  }
}
