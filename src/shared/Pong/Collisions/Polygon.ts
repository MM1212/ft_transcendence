import { Vector2D } from "../utils/Vector";
import { Line } from "../utils/types";

export abstract class Polygon {
  protected points: number[];
  protected vertices: number;
  protected center: Vector2D;
  public width: number;
  public height: number;

  constructor() {
    this.vertices = 0;
    this.center = Vector2D.Zero;
    this.points = [];
    this.width = 0;
    this.height = 0;
  }

  get getPoints() {
    return this.points;
  }
  get getVertices() {
    return this.vertices;
  }
  get getCenter() {
    return this.center;
  }
  get getWidth() {
    return this.width;
  }
  get getHeight() {
    return this.height;
  }
  set setCenter(center: Vector2D) {
    this.center = center;
  }

  abstract update(center: Vector2D): void;

  getVertice(index: number): Vector2D {
    if (index < 0 || index >= this.points.length)
      throw new Error("Index out of bounds");
    return new Vector2D(this.points[index * 2], this.points[index * 2 + 1]);
  }

  get vertices2D(): Vector2D[] {
    const verticesCount = this.points.length / 2;
    const vertices = new Array<Vector2D>(verticesCount);

    for (let i = 0; i < this.points.length; i += 2)
      vertices[Math.round(i / 2)] = new Vector2D(
        this.points[i],
        this.points[i + 1]
      );

    return vertices;
  }

  static areLinesIntersecting(line1: Line, line2: Line): false | Vector2D {
    const dir1 = line1.end.subtract(line1.start);
    const dir2 = line2.end.subtract(line2.start);

    const p1 = line1.start;
    const p2 = line2.start;
    const p = p2.subtract(p1);

    const determinant = dir1.x * dir2.y - dir1.y * dir2.x;

    if (determinant === 0) {
      // Lines are parallel
      return false;
    }

    const t1 = (p.x * dir2.y - p.y * dir2.x) / determinant;
    const t2 = (p.x * dir1.y - p.y * dir1.x) / determinant;

    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1)
      return new Vector2D(
        line1.start.x + dir1.x * t1,
        line1.start.y + dir1.y * t1
      );
    return false;
  }

  collides(
    polygon: Polygon
  ): { obj: Line; target: Line; intersection: Vector2D } | undefined {
    const lines_1: Line[] = [];
    const lines_2: Line[] = [];

    for (let i = 0; i < this.points.length - 2; i += 2) {
      lines_1.push({
        start: new Vector2D(this.points[i], this.points[i + 1]),
        end: new Vector2D(this.points[i + 2], this.points[i + 3]),
      });
    }
    lines_1.push({
      start: lines_1[lines_1.length - 1].end,
      end: new Vector2D(this.points[0], this.points[1]),
    });

    for (let i = 0; i < polygon.points.length - 2; i += 2) {
      lines_2.push({
        start: new Vector2D(polygon.points[i], polygon.points[i + 1]),
        end: new Vector2D(polygon.points[i + 2], polygon.points[i + 3]),
      });
    }
    lines_2.push({
      start: lines_2[lines_2.length - 1].end,
      end: new Vector2D(polygon.points[0], polygon.points[1]),
    });

    for (const line of lines_1) {
      for (const line2 of lines_2) {
        const b = Polygon.areLinesIntersecting(line, line2);
        if (b) return { obj: line, target: line2, intersection: b };
      }
    }

    return undefined;
  }
}

function createBall(
  vertices: number,
  radius: number,
  center: Vector2D
): number[] {
  const points: number[] = [];

  for (let i = 0; i < vertices; i++) {
    const angle = (i / vertices) * Math.PI * 2;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    points.push(x, y);
  }
  return points;
}

export class BallPolygon extends Polygon {
  constructor(center: Vector2D, diameter: number, vertices: number) {
    const points = createBall(vertices, diameter / 2, center);
    super();

    this.vertices = vertices;
    this.center = center;
    this.points = points;
    this.width = diameter;
    this.height = this.width;
  }

  update(center: Vector2D) {
    this.points.length = 0;
    this.center = center;
    for (let i = 0; i < this.vertices; i++) {
      const angle = (i / this.vertices) * Math.PI * 2;
      const x = center.x + (this.width / 2) * Math.cos(angle);
      const y = center.y + (this.height / 2) * Math.sin(angle);
      this.points.push(x, y);
    }
  }
}

function createBar(
  direction: Vector2D,
  width: number,
  height: number,
  center: Vector2D
): number[] {
  const points: number[] = [];

  const topLeft: Vector2D = new Vector2D(
    center.x + (width / 2) * direction.x,
    center.y - (height / 2) * direction.y
  );
  const topRight: Vector2D = new Vector2D(
    center.x - (width / 2) * direction.x,
    center.y - (height / 2) * direction.y
  );
  const bottomRight: Vector2D = new Vector2D(
    center.x - (width / 2) * direction.x,
    center.y + (height / 2) * direction.y
  );
  const bottomLeft: Vector2D = new Vector2D(
    center.x + (width / 2) * direction.x,
    center.y + (height / 2) * direction.y
  );
  points.push(topLeft.x, topLeft.y);
  points.push(topRight.x, topRight.y);
  points.push(bottomRight.x, bottomRight.y);
  points.push(bottomLeft.x, bottomLeft.y);

  return points;
}

export class BarPolygon extends Polygon {
  constructor(
    center: Vector2D,
    width: number,
    height: number,
    public direction: Vector2D
  ) {
    const points = createBar(direction, width, height, center);

    super();

    this.vertices = 4;
    this.center = center;
    this.points = points;
    this.width = width;
    this.height = height;
  }

  update(center: Vector2D) {
    this.center = center;
    this.points = createBar(this.direction, this.width, this.height, center);
  }
}
