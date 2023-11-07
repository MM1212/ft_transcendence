import { UIGameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { IceTex } from "../index";
import { Bar } from "@shared/Pong/Paddles/Bar";
import * as PIXI from "pixi.js";
import { Ice } from "@shared/Pong/SpecialPowers/Ice";

export class UIIce extends Ice {
    public displayObject: PIXI.Sprite;
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super(center, velocity, shooter);
        this.displayObject = new PIXI.Sprite(IceTex);
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
            return true;
        }
        return false;
    }
}