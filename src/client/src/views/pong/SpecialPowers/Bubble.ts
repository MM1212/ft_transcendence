import { Vector2D } from "../utils/Vector";
import { BubbleTex } from "../utils";
import { Bar } from "@shared/Pong/Paddles/Bar";
import * as PIXI from "pixi.js";
import { Bubble } from "@shared/Pong/SpecialPowers/Bubble";

export class UIBubble extends Bubble {
    public displayObject: PIXI.Sprite;
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar, tag: string) {
        super(center, velocity, shooter);
        this.displayObject = new PIXI.Sprite(BubbleTex);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = center.x;
        this.displayObject.y = center.y;
        this.tag = tag;
    }

    update(): void {
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
    }

    removePower(): void {
    }

    onCollide(): boolean {
        return false;
    }

    //onCollide(target: UIGameObject): boolean {
    //    if (super.onCollide(target) === true)
    //    {
    //        this.game.remove(this);
    //        return true;
    //    }
    //    return false;
    //}
}