import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { specialpowerConfig } from "../config/configInterface";
import { SpecialPower } from "./SpecialPower";
import { Bar } from "../Paddles/Bar";
import { Effect } from "./Effect";
import { Ball } from "../Ball";
import PongModel from "../../../typings/models/pong";

export class Spark extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super(PongModel.Models.LobbyParticipantSpecialPowerType.spark, center, velocity, shooter, specialpowerConfig.spark.diameter, specialpowerConfig.spark.vertices);
        this.tag += this.id;
        shooter.manaBar.spendMana(this.manaCost);
        shooter.manaBar.manaStep = shooter.manaBar.mana;
    }

    get manaCost(): number {
        return specialpowerConfig.spark.manaCost;
    }

    onCollide(target: GameObject): boolean {
        if (target instanceof SpecialPower)
        {
            return true;
        }


        if (target instanceof Bar)
        {
            this.shooterObject.stats.iHitMyPower(target);
            if (target.getEffect === undefined)
                target.setEffect(new Effect("REVERSE", target));
        } else if (target instanceof Ball)
        {
            this.shooterObject.stats.iHitMyPower(undefined);
        }
        this.game.remove(this);
        return false;
    }
}
