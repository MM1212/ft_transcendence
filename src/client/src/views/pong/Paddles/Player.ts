import * as PIXI from 'pixi.js';
import { Vector2D } from "../utils/Vector";
import { SpecialPowerType } from '@shared/Pong/SpecialPowers/SpecialPower';
import { UIGame } from '../Game';
import { UIMana } from './Mana';
import { UIEnergy } from './Energy';
import { UIShooter } from '../SpecialPowers/Shooter';
import { Player } from '@shared/Pong/Paddles/Player';

export interface KeyControls {
    up: string;
    down: string;
    boost: string;
    shoot: string;
}

/* ------------------- Player ------------------- */

export class UIPlayer extends Player {
    public displayObject: PIXI.Sprite;
    
    public mana: UIMana;
    public energy: UIEnergy;
    public shooter: UIShooter | undefined;
    
    constructor (texture: PIXI.Texture, x: number, y: number, public keys: KeyControls, tag: string, public direction: Vector2D, specialPower: SpecialPowerType, uigame: UIGame)
    {
        super(x, y, keys, tag, direction, specialPower, uigame);
        this.displayObject = new PIXI.Sprite(texture);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
        this.mana = new UIMana(tag, uigame);
        this.energy = new UIEnergy(tag, uigame);
        this.shooter = undefined;
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
        if (super.update(delta) === true)
        {
            this.displayObject.y = this.center.y;
            this.updatePolygon(this.center);
            
        }
        this.mana.update(this.tag, delta);
        this.energy.update(this.tag, delta);
        if (this.shooter !== undefined) {
            //console.log(this)
            this.shooter.update(delta, this);
            this.displayObject.y = this.center.y;
        }
        return true;
    }
    
}