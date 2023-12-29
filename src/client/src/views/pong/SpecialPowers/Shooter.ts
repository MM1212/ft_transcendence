import { UIGame } from "../Game";
import * as PIXI from 'pixi.js';
import { Shooter } from "@shared/Pong/SpecialPowers/Shooter";
import { Bar } from "@shared/Pong/Paddles/Bar";
import { UIBar } from "../Paddles/Bar";

export class UIShooter extends Shooter {
    public displayObject: PIXI.Graphics;
    constructor(shooter: Bar, game: UIGame) {
        super(shooter, game);
        this.displayObject = new PIXI.Graphics();
        this.displayObject.clear();
    }

    draw(line: {start: number[], end: number[]}): void {
        this.displayObject.clear();
        this.displayObject.lineStyle(4, 0xff0000, 1);
        this.displayObject.moveTo(line.start[0], line.start[1]);
        this.displayObject.lineTo(line.end[0], line.end[1]);
    }

    shootBall(shooter: UIBar): void {
        this.displayObject.clear();
        this.displayObject.destroy();
        shooter.setShooter(undefined);
    }

    update(): boolean {
        return true;
    }
}