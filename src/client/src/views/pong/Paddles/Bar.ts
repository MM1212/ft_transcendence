import { Bar } from '@shared/Pong/Paddles/Bar';
import { SpecialPowerType } from '@shared/Pong/SpecialPowers/SpecialPower';
import { Vector2D } from '../utils/Vector';
import { UIBubble } from '../SpecialPowers/Bubble';
import { UIIce } from '../SpecialPowers/Ice';
import { UIFire } from '../SpecialPowers/Fire';
import { UISpark } from '../SpecialPowers/Spark';
import { UIGhost } from '../SpecialPowers/Ghost';

export abstract class UIBar extends Bar {
  public static create(
    specialPower: SpecialPowerType,
    center: Vector2D,
    direction: number,
    shooter: Bar,
    tag: string
  ) {
    console.log('create' + specialPower+ " " + tag);
    switch (specialPower) {
      case 'Bubble':
        return new UIBubble(
            new Vector2D(center.x + 40 * direction, center.y),
            new Vector2D(direction === 1 ? 5 : -5, 0),
            shooter, 
            tag
          );
      case 'Ice':
        return new UIIce(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter, 
          tag
        );
      case 'Fire':
        return new UIFire(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter, 
          tag
        );
      case 'Spark':
        return new UISpark(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter, 
          tag
        );
      case 'Ghost':
        return new UIGhost(
          new Vector2D(center.x + 40 * direction, center.y),
          new Vector2D(direction === 1 ? 5 : -5, 0),
          shooter, 
          tag
        );
    }
  }
}
