import * as PIXI from 'pixi.js';
import { Game } from '@shared/Pong/Game';
import { Ball } from '@shared/Pong/Ball';
import { ballsConfig } from '@shared/Pong/config/configInterface';
import PongModel from '@typings/models/pong';
import { buildTexture } from './utils';

/*
public displayObject: PIXI.AnimatedSprite | PIXI.Sprite;
  constructor(
    x: number,
    y: number,
    game: Game,
    ballSkinName: keyof typeof ballsConfig
  ) {
    super(x, y, game, ballSkinName);
    const path = `${PongModel.Endpoints.Targets.Balls}/${ballSkinName}/${ballSkinName}`;
    this.displayObject = new PIXI.Sprite(PIXI.Texture.EMPTY);
    buildAnimation(
      path + '.json',
      path,
      ballsConfig[ballSkinName].frames
    ).then((frames) => {
      (this.game as UIGame).app.stage.removeChild(this.displayObject);
      this.displayObject.destroy();
      this.displayObject = new PIXI.AnimatedSprite(frames);
      if (!(this.displayObject instanceof PIXI.AnimatedSprite)) return;
      this.displayObject.anchor.set(0.5);
      this.displayObject.x = x;
      this.displayObject.y = y;
      this.displayObject.animationSpeed = 0.1;
      this.displayObject.play();
      (this.game as UIGame).app.stage.addChild(this.displayObject);
    });
  }


*/

export class UIBall extends Ball {
  public displayObject: PIXI.Sprite;
  constructor(
    x: number,
    y: number,
    game: Game,
    ballSkinName: keyof typeof ballsConfig
  ) {
    super(x, y, game, ballSkinName);
    this.displayObject = new PIXI.Sprite(buildTexture(
      `${PongModel.Endpoints.Targets.Balls}/${ballSkinName}/${ballSkinName}.webp`
    ));
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = x;
    this.displayObject.y = y;
  }

  resetBall(): void {}

  update(): void {
    this.displayObject.rotation += 0.01;
  }

  onCollide(): void {}
}
