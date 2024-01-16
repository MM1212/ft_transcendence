import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { specialpowerConfig } from "../config/configInterface";
import { SpecialPower } from "./SpecialPower";
import { Bar } from "../Paddles/Bar";
import { Effect } from "./Effect";
import { Ball } from "../Ball";
import PongModel from "../../../typings/models/pong";

export class Ice extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super(PongModel.Models.LobbyParticipantSpecialPowerType.ice, center, velocity, shooter, specialpowerConfig.ice.diameter, specialpowerConfig.ice.vertices);
        this.tag += this.id;
        shooter.manaBar.spendMana(this.manaCost);
        shooter.manaBar.manaStep = shooter.manaBar.mana;
    }

    get manaCost(): number {
        return specialpowerConfig.ice.manaCost;
    }

    onCollide(target: GameObject): boolean {

        if (target instanceof Bar)
        {
            this.shooterObject.stats.iHitMyPower(target);
            if (target.getEffect === undefined)
                target.setEffect(new Effect("SLOW", target));
            else
                target.setEffect(new Effect("STOP", target));
        }

        if (target instanceof SpecialPower || target instanceof Ball)
        {
            return true;
        }
        this.game.remove(this);
        return false;
    }
}
