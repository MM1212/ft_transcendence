export default class Vector2D {
  public x: number;
  public y: number;

  static readonly Zero = new Vector2D(0);

  constructor(scale: number);
  constructor(x: number, y: number);
  constructor(other: Vector2D);
  constructor(other: [number, number]);
  constructor(other: { x: number; y: number });
  constructor(
    x: number | Vector2D | [number, number] | { x: number; y: number },
    y?: number
  ) {
    if (x instanceof Vector2D) {
      this.x = x.x;
      this.y = x.y;
    } else if (Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
    } else if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else if (y === undefined) {
      this.x = x;
      this.y = x;
    } else {
      this.x = x;
      this.y = y;
    }
  }
  add(scale: number): Vector2D;
  add(x: number, y: number): Vector2D;
  add(other: Vector2D): Vector2D;
  add(x: number | Vector2D, y?: number): Vector2D {
    if (x instanceof Vector2D) return new Vector2D(this.x + x.x, this.y + x.y);
    else if (y === undefined) return new Vector2D(this.x + x, this.y + x);
    else return new Vector2D(this.x + x, this.y + y);
  }
  subtract(scale: number): Vector2D;
  subtract(x: number, y: number): Vector2D;
  subtract(other: Vector2D): Vector2D;
  subtract(x: number | Vector2D, y?: number): Vector2D {
    if (x instanceof Vector2D) return new Vector2D(this.x - x.x, this.y - x.y);
    else if (y === undefined) return new Vector2D(this.x - x, this.y - x);
    else return new Vector2D(this.x - x, this.y - y);
  }
  multiply(scale: number): Vector2D;
  multiply(x: number, y: number): Vector2D;
  multiply(other: Vector2D): Vector2D;
  multiply(x: number | Vector2D, y?: number): Vector2D {
    if (x instanceof Vector2D) return new Vector2D(this.x * x.x, this.y * x.y);
    else if (y === undefined) return new Vector2D(this.x * x, this.y * x);
    else return new Vector2D(this.x * x, this.y * y);
  }
  divide(scale: number): Vector2D;
  divide(x: number, y: number): Vector2D;
  divide(other: Vector2D): Vector2D;
  divide(x: number | Vector2D, y?: number): Vector2D {
    if (x instanceof Vector2D) return new Vector2D(this.x / x.x, this.y / x.y);
    else if (y === undefined) return new Vector2D(this.x / x, this.y / x);
    else return new Vector2D(this.x / x, this.y / y);
  }
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }
  cross(other: Vector2D): number {
    return this.x * other.y - this.y * other.x;
  }
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize(): Vector2D {
    return this.divide(this.magnitude());
  }
  angle(): number {
    return Math.atan2(this.y, this.x);
  }
  rotate(angle: number): Vector2D {
    return new Vector2D(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  }
  reflect(normal: Vector2D): Vector2D {
    return this.subtract(normal.multiply(2 * this.dot(normal)));
  }
  length(): number {
    return this.magnitude();
  }
  distance(other: Vector2D): number {
    return this.subtract(other).magnitude();
  }
  invert() {
    return this.multiply(-1);
  }
  equals(other: Vector2D): boolean {
    return this.x === other.x && this.y === other.y;
  }
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
  toArray(): [number, number] {
    return [this.x, this.y];
  }
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  get NaN(): boolean {
    return isNaN(this.x) || isNaN(this.y);
  }

  floor(): Vector2D {
    return new Vector2D(Math.floor(this.x), Math.floor(this.y));
  }
  ceil(): Vector2D {
    return new Vector2D(Math.ceil(this.x), Math.ceil(this.y));
  }
  round(decimals: number = 3): Vector2D {
    const scale = Math.pow(10, decimals);
    return new Vector2D(
      Math.round(this.x * scale) / scale,
      Math.round(this.y * scale) / scale
    );
  }

  static average(...vectors: Vector2D[]): Vector2D {
    return vectors.reduce((a, b) => a.add(b)).divide(vectors.length);
  }
  static distance(a: Vector2D, b: Vector2D): number {
    return a.distance(b);
  }

  // variants
  public get width(): number {
    return this.x;
  }
  public get height(): number {
    return this.y;
  }
  public get left(): number {
    return this.x;
  }
  public get top(): number {
    return this.y;
  }
}
