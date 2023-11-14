import { GameObject } from '@shared/Pong/GameObject';
import { Game } from '@shared/Pong/Game';
import * as PIXI from 'pixi.js';

export abstract class UIGameObject extends GameObject {
    abstract readonly displayObject: PIXI.Container;
    constructor(tag: string, game: Game) {
        super(tag, game);
    }
}
