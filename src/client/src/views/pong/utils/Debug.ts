import * as PIXI from 'pixi.js';
import { UIGameObject } from '../GameObject';

export class Debug {
    private debugGraphics: PIXI.Graphics;
    private graphics: PIXI.Graphics[] = [];

    public _enabled = false;
    public get isDebug(): boolean {
        return this._enabled;
    }
    public set isDebug(value: boolean) {
        this._enabled = value;
        console.log("isDebug", value);
        if (value === false)
            this.clear();
    }
    constructor(public app: PIXI.Application) {
        this.debugGraphics = new PIXI.Graphics();
        this.debugGraphics.zIndex = 999999;
        app.stage.addChild(this.debugGraphics);
    }

    debugDraw(gameObj: UIGameObject[], ): void {
        if (this._enabled === false) return;
        console.log("debugDraw", gameObj.length);
        this.clear();
        gameObj.forEach((obj) => {
            this.drawPolygon(obj);
        });
    }

    drawPolygon(obj: UIGameObject) {
        if (obj.collider === undefined) return;
        const polygon = obj.collider.polygon;
        const points = polygon.getPoints;

        // Draw bounding box
        const boundBoxPoints: number[] = obj.collider.boundingBox.getPoints;
        this.debugGraphics.beginFill(0x0000ff);
        this.debugGraphics.moveTo(boundBoxPoints[0], boundBoxPoints[1]);
        for (let i = 2; i < boundBoxPoints.length; i += 2) {
            this.debugGraphics.lineTo(boundBoxPoints[i], boundBoxPoints[i + 1]);
        }
        this.debugGraphics.endFill();

        // Draw polygon
        this.debugGraphics.moveTo(points[0], points[1]);
        this.debugGraphics.beginFill(0x00ff00);
        for (let i = 2; i < points.length; i += 2) {
            this.debugGraphics.lineTo(points[i], points[i + 1]);
        }
        this.debugGraphics.endFill();

        // Draw circle for vertices
        const printPoints = polygon;
        printPoints.getPoints.forEach((point, i) => {
            if (i % 2 === 0) {
                this.debugGraphics.beginFill(0xffff00);
                this.debugGraphics.drawCircle(point, printPoints.getPoints[i + 1], 2);
                this.debugGraphics.endFill();
            }
        });

        // Draw center
        this.debugGraphics.beginFill(0xff0000);
        this.debugGraphics.drawCircle(obj.collider.center.x, obj.collider.center.y, 2);
        this.debugGraphics.endFill();

        // Draw collision line
        const line = obj.collider.line;
        if (line)
        {
            const graphics = new PIXI.Graphics();
            graphics.beginFill(0xFF0000);
            graphics.lineStyle(2, 0xFF0000, 1);
            graphics.moveTo(line?.end.x, line?.end.y);
            graphics.lineTo(line?.start.x, line?.start.y);
            graphics.beginFill("#ff0000")
            graphics.drawCircle(line?.start.x, line?.start.y, 2)
            graphics.drawCircle(line?.end.x, line?.end.y, 2)
            graphics.endFill();
            this.app.stage.addChild(graphics);
            this.graphics.push(graphics);
        }
    }

    clear() {
        this.debugGraphics.clear();
        this.app.stage.removeChild(...this.graphics);
        this.graphics.length = 0;
    }
}
