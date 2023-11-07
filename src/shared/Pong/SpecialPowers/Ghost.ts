import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { specialpowerConfig } from "../config/configInterface";
import { SpecialPower } from "./SpecialPower";
import { Bar } from "../Paddles/Bar";
import { Effect } from "./Effect";

export class Ghost extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super("Ghost", center, velocity, shooter, specialpowerConfig.ghost.diameter, specialpowerConfig.ghost.vertices);
    }

    onCollide(target: GameObject): boolean {

        if (!(target instanceof SpecialPower))
        {
            target.setEffect(new Effect("INVISIBLE", target));
            this.game.remove(this);
            return true;
        }
        return false;
    }
}
