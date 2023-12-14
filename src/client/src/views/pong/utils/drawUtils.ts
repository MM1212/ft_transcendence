import * as PIXI from 'pixi.js'; 

export function drawLines(lineColor: number, canvas: PIXI.Application): void {
    const middleLine = new PIXI.Graphics();
    middleLine.lineStyle(4, lineColor, 1);
    const height = canvas.view.height;
    for (let i = 5; i < height; i += 35) {
        middleLine.moveTo(canvas.view.width / 2, i);
        middleLine.lineTo(canvas.view.width / 2, i+25);
    }
    canvas.stage.addChild(middleLine);

    const circle = new PIXI.Graphics();
    circle.lineStyle(4, lineColor, 1);
    circle.drawCircle(canvas.view.width / 2, canvas.view.height / 2, 100);
    circle.closePath();
    canvas.stage.addChild(circle);
}
