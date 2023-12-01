import { Bar } from "./Bar";
import { Vector2D } from "../utils/Vector";
import { Game } from "../Game";
import { GameObject } from "../GameObject";

const UP    = new Vector2D(0, -5);
const DOWN  = new Vector2D(0, 5);
const STOP  = new Vector2D(0, 0);

export class Bot extends Bar {

    private botSpeed: number = 5;
    
    constructor (x: number, y: number, tag: string, public direction: Vector2D, game: Game) {
        super(x, y, tag, direction, game);
    }

    // add acceleration to the bot
    // add powers to the bot
    // add bot powers
    // add inteligent ball predicition to the bot
    // add bot difficulty:
    // add bot reaction time

    update(delta: number): void {
        this.hasChanged = false;
        const ballPosition = this.game.getObjectByTag('Bolinha')?.getCenter;
        if (!ballPosition) return;
        if (ballPosition?.y < this.center.y - 5) {
            this.setMove(true);
            this.velocity = UP.multiply(this.effectVelocity);
        }
        else if (ballPosition?.y > this.center.y + 5) {
            this.setMove(true);
            this.velocity = DOWN.multiply(this.effectVelocity);
        }
        else {
            this.setMove(false);
            this.velocity = STOP;
        }

        if (this.move && this.checkArenaCollision()) {
            this.center.y += this.velocity.y * this.acceleration * delta;
            this.hasChanged = true;
        }

        this.mana.update(this.tag, delta);
        this.energy.update(this.tag, delta);

        if (this.effect !== undefined) {
            this.effect.update(delta, this);
        }
    }

    onCollide(target: GameObject, line: { start: Vector2D; end: Vector2D; }): void {
        
    }
}