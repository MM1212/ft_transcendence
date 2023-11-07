import * as PIXI from 'pixi.js';
import { GameObject } from '@shared/Pong/GameObject';
import { Game } from '@shared/Pong/Game';
import { Ball } from '@shared/Pong/Ball';

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

    update(delta: number): void {
        super.update(delta);
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
        if (this.effect !== undefined) {
            this.effect.update(delta, this);
        }
    }

    onCollide(target: GameObject): void {
        super.onCollide(target);
    }
}
