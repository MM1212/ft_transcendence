import { UIGameObject } from "../GameObject";
import { Effect } from "@shared/Pong/SpecialPowers/Effect";

export class UIEffect extends Effect {
    constructor(effectName: string, target: UIGameObject) {
        super(effectName, target);
    }

    update(delta: number, obj: UIGameObject): void {
        super.update(delta, obj);
        console.log("here", obj.hitAmountEffect);
        if (obj.hitAmountEffect <= 0)
        {
            console.log('effect over', obj.displayObject.alpha);
            if (obj.displayObject.alpha < 1)
                obj.displayObject.alpha = 1;
        }
    }
}