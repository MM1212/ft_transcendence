import * as PIXI from 'pixi.js';
import { Game } from '@shared/Pong/Game';
import { Ball } from '@shared/Pong/Ball';
import { UIEffect } from './SpecialPowers/Effect';

export class UIBall extends Ball {
    public displayObject: PIXI.Sprite;
    constructor(x: number, y: number, texture: PIXI.Texture, game: Game) {
        super(x, y, game);
        this.displayObject = PIXI.Sprite.from(texture);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = x;
        this.displayObject.y = y;

        // todo: color change
        const blueTranform = new PIXI.ColorMatrixFilter();
        blueTranform.hue(60, false);
        this.displayObject.filters = [blueTranform];
    }

    resetBall(x: number): void {
    }

    update(delta: number): void {
    }
    
    onCollide(): void {
    }
}
