import * as PIXI from 'pixi.js';
import { Game } from '@shared/Pong/Game';
import { Ball } from '@shared/Pong/Ball';
//import { UIEffect } from './SpecialPowers/Effect';
import { ballsConfig } from '@shared/Pong/config/configInterface';
import PongModel from '@typings/models/pong';
import { buildTexture } from './utils';

export class UIBall extends Ball {
    public displayObject: PIXI.Sprite;
    constructor(x: number, y: number, game: Game, ballSkinName: keyof typeof ballsConfig) {
        super(x, y, game, ballSkinName);
        
        const ballObj = ballsConfig[ballSkinName];
        const texPath = PongModel.Endpoints.Targets.Connect.concat("/".concat(ballObj.image));
        console.log("texPath: " + texPath);
        const texture = buildTexture(texPath);
        this.displayObject = PIXI.Sprite.from(texture);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = x;
        this.displayObject.y = y;   
    }

    resetBall(): void {
    }

    update(): void {
    }
    
    onCollide(): void {
    }
}
