import { UIGame } from "../Game";
import * as PIXI from 'pixi.js';
import { Shooter } from "@shared/Pong/SpecialPowers/Shooter";
import { Bar } from "@shared/Pong/Paddles/Bar";

export class UIShooter extends Shooter {
    public displayObject: PIXI.Graphics;
    constructor(shooter: Bar, game: UIGame) {
        super(shooter, game);
        this.displayObject = new PIXI.Graphics();
    }

    shootBall(shooter: Bar): void {
        super.shootBall(shooter);
        this.displayObject.clear();
    }

    update(delta: number, shooter: Bar): boolean {
        this.displayObject.clear();
        if (super.update(delta, shooter) === false) {
            (this.game as UIGame).app.stage.removeChild(this.displayObject);
            return false;
        }
        this.displayObject.lineStyle(4, 0xff0000, 1);
        this.displayObject.moveTo(this.line.start.x, this.line.start.y);
        this.displayObject.lineTo(this.line.end.x, this.line.end.y);
        (this.game as UIGame).app.stage.addChild(this.displayObject);
        return true;
    }
}