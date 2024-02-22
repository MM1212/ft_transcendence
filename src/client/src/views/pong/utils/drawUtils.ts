import * as PIXI from 'pixi.js';

export function drawLines(lineColor: number, canvas: PIXI.Application): void {
  const topLine = new PIXI.Graphics();
  topLine.lineStyle(4, '#000000', 1);
  topLine.moveTo(0, 100);
  topLine.lineTo(canvas.view.width, 100);
  canvas.stage.addChild(topLine);

  const middleLine = new PIXI.Graphics();
  middleLine.lineStyle(4, lineColor, 0.5);
  const height = canvas.view.height;
  for (let i = 5; i < height; i += 35) {
    middleLine.moveTo(canvas.view.width / 2, i);
    middleLine.lineTo(canvas.view.width / 2, i + 25);
  }
  canvas.stage.addChild(middleLine);

  const circle = new PIXI.Graphics();
  circle.lineStyle(4, lineColor, 0.5);
  circle.drawCircle(canvas.view.width / 2, canvas.view.height / 2, 100);
  circle.closePath();
  canvas.stage.addChild(circle);

  const bottomLine = new PIXI.Graphics();
  bottomLine.lineStyle(4, '#000000', 1);
  bottomLine.moveTo(0, canvas.view.height - 100);
  bottomLine.lineTo(canvas.view.width, canvas.view.height - 100);
  canvas.stage.addChild(bottomLine);
}

export const scoreStyleSettings: Partial<PIXI.ITextStyle> = {
  align: 'center',
  fontFamily: 'arial',
  fontSize: 36,
  fontWeight: 'bold',
  fill: ['#FF2C05', '#FFCE03'], // gradient
  stroke: '#4a1850',
  strokeThickness: 4,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 3,
  dropShadowAngle: Math.PI / 4,
  dropShadowDistance: 2,
};

export const countdownStyleSettings: Partial<PIXI.ITextStyle> = {
  align: 'center',
  fontFamily: 'helvetica',
  fontSize: 36,
  fontWeight: '600',
  fill: ['#FF2C05', '#FFCE03'], // gradient
  stroke: '#4a1850',
  strokeThickness: 2,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 3,
  dropShadowAngle: Math.PI / 4,
  dropShadowDistance: 2,
};
