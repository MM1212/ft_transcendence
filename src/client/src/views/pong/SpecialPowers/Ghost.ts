import { UIGameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { GhostTex } from "../index";
import { Bar } from "@shared/Pong/Paddles/Bar";
import * as PIXI from "pixi.js";
import { Ghost } from "@shared/Pong/SpecialPowers/Ghost";

export class UIGhost extends Ghost {
    public displayObject: PIXI.Sprite;
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super(center, velocity, shooter);
        this.displayObject = new PIXI.Sprite(GhostTex);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = center.x;
        this.displayObject.y = center.y;
    }

    update(delta: number): boolean {
        if (super.update(delta) === false) { return false; }
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
        return true;
    }

    onCollide(target: UIGameObject): boolean {
        if (super.onCollide(target) === true)
        {
            this.game.remove(this);
            target.displayObject.alpha = 0;
            return true;
        }
        return false;
    }
}