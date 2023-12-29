import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { BallPolygon } from "../Collisions/Polygon";
import { Bar } from "../Paddles/Bar";
import { Collider } from "../Collisions/Collider";

export abstract class SpecialPower extends GameObject {
  protected shooterObject: Bar;

  constructor(
    tag: string,
    center: Vector2D,
    velocity: Vector2D,
    shooter: Bar,
    diameter: number,
    vertices: number
  ) {
    super(tag, shooter.game);

    this.center = center;
    this._move = true;
    this.direction = Vector2D.Zero;
    this.acceleration = 1.5;
    this.velocity = velocity || new Vector2D(5, 0);
    this.height = diameter;
    this.width = diameter;

    this.collider = Collider.fromPolygon(
      new BallPolygon(this.center, this.width, vertices)
    );
    this.shooterObject = shooter;
    this.hasChanged = true;
  }

  updatePolygon(center: Vector2D): void {
    if (this.collider === undefined) return;
    this.collider.polygon.update(center);
    this.collider.boundingBox.center = center;
    this.collider.center = center;
    this.collider.updateBoundingBox();
  }

  update(delta: number): void {
    //if (!this.move) return false;
    if (this.getCenter.x < 0 || this.getCenter.x > this.game.width) {
      this.game.remove(this);
      return;
    }
    this.center = this.center.add(
      this.velocity.x * this.acceleration * delta,
      this.velocity.y * this.acceleration * delta
    );
    this.updatePolygon(this.center);
  }

  onCollide(target: GameObject): boolean {
    console.log("collide");

    if (!(target instanceof SpecialPower)) return false;
    return true;
  }

  abstract get manaCost(): number;
}
