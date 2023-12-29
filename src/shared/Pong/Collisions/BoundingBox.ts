import { Polygon } from './Polygon';
import { Vector2D } from '../utils/Vector';

export class BoundingBox {

    constructor(
        public position: Vector2D = Vector2D.Zero,
        public size: Vector2D = Vector2D.Zero,
    ) {}

    get empty() { return this.size.x === 0 || this.size.y === 0; }
    get left() { return this.position.x; }
    get right() { return (this.position.x + this.size.x); }
    get top() { return this.position.y; }
    get bottom() { return (this.position.y + this.size.y); }

    get width() { return this.size.x; }
    get height() { return this.size.y; }

    get getPoints() {
        return [
            this.position.x, this.position.y,
            this.position.x + this.size.x, this.position.y,
            this.position.x + this.size.x, this.position.y + this.size.y,
            this.position.x, this.position.y + this.size.y
        ];
    }

    get center() { return this.position.add(this.size.divide(2)); }
    set center(value: Vector2D) { this.position = value.subtract(this.size.divide(2)); }

    collides(other: BoundingBox): boolean {
        return (
            this.left <= other.right &&
            this.right >= other.left &&
            this.top <= other.bottom &&
            this.bottom >= other.top
        );
    }

    static fromPolygon(polygon: Polygon): BoundingBox {
        const vertices = polygon.vertices2D;

        if (vertices.length === 0)
            return new BoundingBox();
        
        const boundingBox = vertices.reduce((bbox, vertex) => {
            return {
                left: Math.min(bbox.left, vertex.x),
                right: Math.max(bbox.right, vertex.x),
                top: Math.min(bbox.top, vertex.y),
                bottom: Math.max(bbox.bottom, vertex.y),
            };
        }, {
            left: vertices[0].x,
            right: vertices[0].x,
            top: vertices[0].y,
            bottom: vertices[0].y,
        });
        
        return new BoundingBox( new Vector2D(boundingBox.left, boundingBox.top), new Vector2D(boundingBox.right - boundingBox.left, boundingBox.bottom - boundingBox.top) );
    }
}
