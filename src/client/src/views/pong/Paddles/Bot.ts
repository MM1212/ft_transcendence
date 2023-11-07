import { Bot } from "@shared/Pong/Paddles/Bot";
import { Vector2D } from "../utils/Vector";
import { UIGame } from "../Game";
import { UIMana } from './Mana';
import { UIEnergy } from './Energy';

import * as PIXI from 'pixi.js';

export class UIBot extends Bot {
    public displayObject: PIXI.Sprite;
    public UImana: UIMana;
    public UIenergy: UIEnergy;
    constructor(texture: PIXI.Texture, x: number, y: number, tag: string, public direction: Vector2D, uigame: UIGame)
    {
        super(x, y, tag, direction, uigame);
        this.displayObject = PIXI.Sprite.from(texture);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = x;
        this.displayObject.y = y;
        this.displayObject.scale.set(0.5);
        this.UImana = new UIMana(this.tag, uigame);
        this.UIenergy = new UIEnergy(this.tag, uigame);
    }

    setScaleDisplayObject(scale: number): void {
        this.displayObject.height = this.height * scale;
        this.displayObject.width = this.width;
    }

    setDisplayObjectCoords(center: Vector2D): void {
        this.displayObject.x = center.x;
        this.displayObject.y = center.y;
    }

    setScale(scale: number): void {
        super.setScale(scale);
        this.setScaleDisplayObject(scale);
        this.setDisplayObjectCoords(this.center);
    }

    update(delta: number): boolean {
        if (super.update(delta) === true) this.displayObject.y = this.center.y; 
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
        return true;
    }
}