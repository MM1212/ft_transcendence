import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { specialpowerConfig } from "../config/configInterface";
import { SpecialPower } from "./SpecialPower";
import { Bar } from "../Paddles/Bar";
import { Effect } from "./Effect";
import { Ball } from "../Ball";


export class Spark extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super("Spark", center, velocity, shooter, specialpowerConfig.spark.diameter, specialpowerConfig.spark.vertices);
        this.tag += this.id;
    }

    onCollide(target: GameObject): boolean {
        if (target instanceof Bar)
        {
            if (target.getEffect === undefined)
                target.setEffect(new Effect("REVERSE", target));
        }

        if (target instanceof SpecialPower || target instanceof Ball)
        {
            return true;
        }
        this.game.remove(this);
        return false;
    }
}
