import { UIGameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { GhostTex } from "../utils";
import { Bar } from "@shared/Pong/Paddles/Bar";
import * as PIXI from "pixi.js";
import { Ghost } from "@shared/Pong/SpecialPowers/Ghost";
import { UIEffect } from "./Effect";

export class UIGhost extends Ghost {
    public displayObject: PIXI.Sprite;
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar, tag: string) {
        super(center, velocity, shooter);
        this.displayObject = new PIXI.Sprite(GhostTex);
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
        // set displayObject to invisible here
        // maybe based on effect timer
        // load effect timer display here
    }

    onCollide(): boolean {
        return false;
    }

    //onCollide(target: UIGameObject): boolean {
    //    if (super.onCollide(target) === true)
    //    {
    //        this.game.remove(this);
    //        target.displayObject.alpha = 0;
    //        target.setEffect(new UIEffect("INVISIBLE", target));
    //        return true;
    //    }
    //    return false;
    //}
}