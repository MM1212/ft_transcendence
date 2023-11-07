import { UIGameObject } from "../GameObject";
import { Effect } from "@shared/Pong/SpecialPowers/Effect";

export class UIEffect extends Effect {
    constructor(effectName: string, target: UIGameObject) {
        super(effectName, target);
    }

    update(delta: number, obj: UIGameObject): void {
        super.update(delta, obj);
        if (this.effectCur >= this.effectMax) {
            if (obj.hitAmountEffect <= 0)
            {
                if (obj.displayObject.alpha === 0)
                    obj.displayObject.alpha = 1;
            }
        }
    }
}