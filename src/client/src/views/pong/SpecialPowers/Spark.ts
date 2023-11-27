import { UIGameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { SparkTex } from "../utils";
import { Bar } from "@shared/Pong/Paddles/Bar";
import * as PIXI from "pixi.js";
import { Spark } from "@shared/Pong/SpecialPowers/Spark";
import { UIEffect } from "./Effect";

export class UISpark extends Spark {
    public displayObject: PIXI.Sprite;
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super(center, velocity, shooter);
        this.displayObject = new PIXI.Sprite(SparkTex);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = center.x;
        this.displayObject.y = center.y;
        //console.log(this)
    }

    update(delta: number): boolean {
        if (super.update(delta) === false) { return false; }
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
        return true;
    }

    onCollide(target: UIGameObject): boolean {
        //console.log("not collide")
        if (super.onCollide(target) === true)
        {
            if (target instanceof Bar)
            {
                if (target.getEffect === undefined)
                    target.setEffect(new UIEffect("REVERSE", target));
            }
            this.game.remove(this);
            return true;
        }
        return false;
    }
}
