import * as PIXI from 'pixi.js';
import { Vector2D } from '../utils/Vector';
import { BallPolygon, BarPolygon } from '@shared/Pong/Collisions/Polygon';

export class UIBallPolygon extends BallPolygon {
    
    public ballPolygon: PIXI.Polygon;
    
    constructor( center: Vector2D, diameter: number, vertices: number, points: number[]) {
        super(center, diameter, vertices, points);
        this.ballPolygon = new PIXI.Polygon(this.points);
    }

    update(center: Vector2D) {
        super.update(center);
        this.ballPolygon.points = this.points;
    }
}

export class UIBarPolygon extends BarPolygon {
    
    public barPolygon: PIXI.Polygon;

    constructor( center: Vector2D, width: number, height: number, public direction: Vector2D) {
        super(center, width, height, direction);
        this.barPolygon = new PIXI.Polygon(this.points);
    }

    update(center: Vector2D) { 
        super.update(center);
        this.barPolygon.points = this.points;
    }
}

