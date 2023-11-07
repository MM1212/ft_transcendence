import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { SpecialPower } from "./SpecialPower";
import { specialpowerConfig } from "../config/configInterface";
import { Bar } from "../Paddles/Bar";

export class Bubble extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super("Bubble", center, velocity, shooter, specialpowerConfig.bubble.diameter, specialpowerConfig.bubble.vertices);
    }

    onCollide(target: GameObject): boolean {
        if (!(target instanceof SpecialPower)){
            this.game.remove(this);
            return true;
        }
        return false;
    }
}
