import Vector2D from '../Vector/Vector2D';
export default class BoundingBox {
  constructor(
    public readonly position: Vector2D,
    public readonly size: Vector2D,
    private readonly halfSize: Vector2D = size.divide(2)
  ) {}
  public get topLeft(): Vector2D {
    return this.position.subtract(this.halfSize);
  }
  public get bottomRight(): Vector2D {
    return this.position.add(this.halfSize);
  }
  public get topRight(): Vector2D {
    return new Vector2D(this.bottomRight.x, this.topLeft.y);
  }
  public get bottomLeft(): Vector2D {
    return new Vector2D(this.topLeft.x, this.bottomRight.y);
  }
  public contains(position: Vector2D): boolean {
    return (
      position.x >= this.topLeft.x &&
      position.x <= this.bottomRight.x &&
      position.y >= this.topLeft.y &&
      position.y <= this.bottomRight.y
    );
  }
  public intersects(boundingBox: BoundingBox): boolean {
    return (
      this.contains(boundingBox.topLeft) ||
      this.contains(boundingBox.bottomRight) ||
      this.contains(boundingBox.topRight) ||
      this.contains(boundingBox.bottomLeft)
    );
  }
  public get center(): Vector2D {
    return this.position;
  }
}
