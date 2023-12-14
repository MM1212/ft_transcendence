import { UIGameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { IceTex } from "../utils";
import { Bar } from "@shared/Pong/Paddles/Bar";
import * as PIXI from "pixi.js";
import { Ice } from "@shared/Pong/SpecialPowers/Ice";
import { UIEffect } from "./Effect";

export class UIIce extends Ice {
    public displayObject: PIXI.Sprite;
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar, tag: string) {
        super(center, velocity, shooter);
        this.displayObject = new PIXI.Sprite(IceTex);
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
        // load effect timer display here
    }

    onCollide(): boolean {
        return true;
    }
}