import { GameObject } from '../GameObject';
import { Vector2D } from '../utils/Vector';
import { BallPolygon } from '../Collisions/Polygon';
import { Bar } from '../Paddles/Bar';

export type SpecialPowerType = 'Spark' | 'Bubble' | 'Ice' | 'Fire' | 'Ghost' | undefined;

export abstract class SpecialPower extends GameObject {
    protected shooterObject: Bar;

    constructor(tag: string, center: Vector2D, velocity: Vector2D, shooter: Bar, diameter: number, vertices: number) {
        super(tag, shooter.game);

        this.center = center;
        this._move = true;
        this.direction = Vector2D.Zero;
        this.acceleration = 1.5;
        this.velocity = velocity || new Vector2D(5, 0);
        this.height = diameter;
        this.width = diameter;

        this.collider.polygon = new BallPolygon(this.center, this.width, vertices, []);
        this.collider.updateBoundingBox();
        this.collider.lastCollision = undefined;
        this.shooterObject = shooter;
    }

    updatePolygon(center: Vector2D): void {
        this.collider.polygon.update(center);
        this.collider.boundingBox.center = center;
        this.collider.center = center;
    }

    update(delta: number): boolean {
        if (!this.move) return false;
        this.center = this.center.add(
            this.velocity.x * this.acceleration * delta,
            this.velocity.y * this.acceleration * delta
        );
        this.updatePolygon(this.center);
        this.collider.updateBoundingBox();
        return true;
    }

    onCollide(target: GameObject): boolean {
        console.log("collide")

        if (!(target instanceof SpecialPower)) return false;
        return true;
    }
}
