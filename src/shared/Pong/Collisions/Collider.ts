import { BoundingBox } from './BoundingBox';
import { GameObject } from '../GameObject';
import { Polygon } from './Polygon';
import { Vector2D } from '../utils/Vector';

export class Collider {
    public center: Vector2D = Vector2D.Zero;
    public lastCollision: Collider | undefined | false;
    public isCollider: boolean = false;
    public target: GameObject | undefined;
    public line: { start: Vector2D, end: Vector2D} | undefined = undefined;
    public intersection: Vector2D | undefined = undefined;

    constructor(
        public readonly boundingBox: BoundingBox = new BoundingBox(),
        public polygon: Polygon
    ) {
        this.updateBoundingBox();
    }

    get enabled() { return !this.boundingBox.empty; }
    get left() { return this.boundingBox.left; }
    get right() { return this.boundingBox.right; }
    get top() { return this.boundingBox.top; }
    get bottom() { return this.boundingBox.bottom; }
    get width() { return this.boundingBox.width; }
    get height() { return this.boundingBox.height; }

    updateBoundingBox(): void {
        const newBoundingBox = BoundingBox.fromPolygon(this.polygon);
    
        this.boundingBox.position = newBoundingBox.position;
        this.boundingBox.size = newBoundingBox.size;
    
        const vertices = this.polygon.vertices2D;
        let sum = new Vector2D(0, 0);
    
        for (const vertex of vertices) {
            sum = sum.add(vertex);
        }
    
        this.center = sum.divide(vertices.length);
    }

    static fromPolygon(polygon: Polygon): Collider {
        return new Collider(BoundingBox.fromPolygon(polygon), polygon);
    }


    public static collidingObjects(ob1: GameObject, ob2: GameObject): boolean
    {
        if (ob1.collider.boundingBox.collides(ob2.collider.boundingBox))
        {
            const co = ob1.getPolygon.collides(ob2.getPolygon);
            if (co != undefined) 
            {
                ob1.collider.isCollider = true;
                ob2.collider.isCollider = true;

                ob1.collider.line = co.obj;
                ob2.collider.line = co.target;

                ob1.collider.target = ob2;
                ob2.collider.target = ob1;

                ob1.collider.intersection = co.intersection;
                ob2.collider.intersection = co.intersection;
                
                if ((ob1.collider?.lastCollision === ob2.collider) || (ob2.collider?.lastCollision === ob1.collider))
                {
                    return false
                }
                
                if (ob1?.onCollide)
                {
                    ob1.onCollide(ob2, co.target);
                }
                if (ob2?.onCollide)
                {
                    ob2.onCollide(ob1, co.obj);
                }
                return (true);
            }
        }
        return (false);
    }

    public reset(){
        //this.target = undefined;
        this.line = undefined;
        this.isCollider = false;
        this.intersection = undefined;
    }

}
