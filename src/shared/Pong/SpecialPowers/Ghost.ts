import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { specialpowerConfig } from "../config/configInterface";
import { SpecialPower } from "./SpecialPower";
import { Bar } from "../Paddles/Bar";
import { Effect } from "./Effect";
import PongModel from "../../../typings/models/pong";

export class Ghost extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super(PongModel.Models.LobbyParticipantSpecialPowerType.ghost, center, velocity, shooter, specialpowerConfig.ghost.diameter, specialpowerConfig.ghost.vertices);
        this.tag += this.id;
        shooter.manaBar.spendMana(this.manaCost);
    }

    get manaCost(): number {
        return specialpowerConfig.ghost.manaCost;
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
