import { UIGameObject } from '../GameObject';
import { Effect } from '@shared/Pong/SpecialPowers/Effect';

export class UIEffect extends Effect {
  constructor(effectName: string, target: UIGameObject) {
    super(effectName, target);

    if (effectName === 'INVISIBLE') {
      target.displayObject.alpha = 0;
    }
  }
}
