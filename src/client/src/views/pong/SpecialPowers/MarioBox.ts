//import { Game } from "../Game";
//import { GameObject } from "../GameObject";
//import { Vector2D } from "../utils/Vector";
//import { MarioBoxTex } from "../main";
//import { specialpowerConfig } from "../config/configInterface";
//import * as PIXI from 'pixi.js';
//import { BarPolygon } from "../Collisions/Polygon";
//import { Ball } from "../Ball";
//
//export class MarioBox extends GameObject {
//    constructor(game: Game) {
//        super("MarioBox", game);
//        this.center = new Vector2D(game.width/2 + 100, game.height/2 + 100); // calculate
//        this.acceleration = 0;
//        this._move = false;
//        this.height = specialpowerConfig.marioBox.diameter;
//        this.width = specialpowerConfig.marioBox.diameter;
//        console.log(this.height, this.width);
//        this.collider.polygon = new BarPolygon(this.center, this.width, this.height, Vector2D.Zero);
//        this.collider.updateBoundingBox();
//        this.collider.lastCollision = undefined;
//    }
//
//    update(delta: number): void 
//    {
//    }
//
//    updatePolygon(center: { x: number; y: number; }): void 
//    {
//    }
//
//    onCollide(target: GameObject, line: { start: Vector2D; end: Vector2D; }): void {
//        if (target instanceof Ball)
//            console.log("MarioBox collided with " + target.tag);
//    }
//}
//
//
//
//export class UIMarioBox extends MarioBox {
//    public displayObject: PIXI.Sprite;
//    constructor(game: Game) {
//        super(game);
//        this.displayObject = PIXI.Sprite.from(MarioBoxTex);
//        this.displayObject.anchor.set(0.5);
//        this.displayObject.x = this.center.x;
//        this.displayObject.y = this.center.y;
//    }
//
//    update(delta: number): void {
//        this.displayObject.x = this.center.x;
//        this.displayObject.y = this.center.y;
//    }
//
//    onCollide(target: GameObject, line: { start: Vector2D; end: Vector2D; }): void {
//        super.onCollide(target, line);
//        this.game.remove(this);
//    }
//}