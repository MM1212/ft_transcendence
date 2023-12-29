import { Game } from "@shared/Pong/Game";
import { ArenaPolygon, ArenaWall } from '@shared/Pong/Collisions/Arena';
import { Vector2D } from '../utils/Vector';
import * as PIXI from 'pixi.js';

export class UIArenaWall extends ArenaWall {
    public readonly displayObject: PIXI.Graphics;

    constructor(position: Vector2D, size: Vector2D, color: number, game: Game) {
        super(position, size, color, game);
        this.displayObject = new PIXI.Graphics();
        this.displayObject.beginFill(color);
        this.displayObject.drawRect(0, 0, size.x, size.y);
        this.displayObject.endFill();
        this.displayObject.x = position.x;
        this.displayObject.y = position.y;
    }
}

export class UIArenaPolygon extends ArenaPolygon {
    
    public arenaPolygon: PIXI.Polygon;
    
    constructor(position:Vector2D, size: Vector2D, game: Game ) {
        super(position, size, game);
        this.arenaPolygon = new PIXI.Polygon(this.points);
    }

    update() {}
}