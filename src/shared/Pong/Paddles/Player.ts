import { Bar } from "./Bar";
import { Vector2D } from "../utils/Vector";
import { SpecialPowerType } from '../SpecialPowers/SpecialPower';
import { Game } from '../Game';
import { GameObject } from '../GameObject';

/* ----------------- Velocity ----------------- */
const UP    = new Vector2D(0, -5);
const DOWN  = new Vector2D(0, 5);
const STOP  = new Vector2D(0, 0);

/* ------------------- Keys ------------------- */
interface KeyState {
    [key: string]: boolean;    
}
export interface KeyControls {
    up: string;
    down: string;
    boost: string;
    shoot: string;
}

/* ------------------- Player ------------------- */
export class Player extends Bar
{
    private keyPressed: KeyState = {
        up: false,
        down: false,
        boost: false,
        shoot: false,
    };
    constructor (
        x: number, y: number, public keys: KeyControls, tag: string, public direction: Vector2D, specialPower: SpecialPowerType, game: Game)
    {
        super(x, y, tag, direction, game);
        this.specialPowerType = specialPower;
    }

    onKeyDown(e: KeyboardEvent): void {
        
        this.keyPressed[e.key] = true;
        
        if (this.keyPressed[this.keys.shoot]) {
            if (this.isShooting === false && this.shooter === undefined && this.hasEnoughMana())
            {
                if (this.specialPowerType !== undefined)
                {
                    this.power = this.createPower(this.specialPowerType, this.center, this.direction.x, this);
                    if (this.power !== undefined)
                    {
                        this.game.add(this.power as unknown as GameObject);
                        this.spendMana();
                    }
                }
            }
            else if (this.isShooting === true)
            {
                this.shooter?.shootBall(this);
            }
        }
    }

    protected createPower(specialPower: SpecialPowerType, center: Vector2D, direction: number, shooter: Bar)
    {
        return Bar.create(specialPower, center, direction, shooter);
    }

    onKeyUp(e: KeyboardEvent): void {
        this.keyPressed[e.key] = false;
    }

    executeMovement():void {
        if      (this.keyPressed[this.keys.up])  {this.setMove(true); this.setVelocity(UP.multiply(this.effectVelocity));  }
        else if (this.keyPressed[this.keys.down])  {this.setMove(true); this.setVelocity(DOWN.multiply(this.effectVelocity));}
        else                            {this.setMove(false); this.setVelocity(STOP);}
        if      (this.keyPressed[this.keys.boost])  {if (this.energy.energy > 2 && this.move) {this.setAcceleration(2); this.energy.spendEnergy(2 * this.game.delta)}}
        else                            {this.setAcceleration(1);}
    }

    update(delta: number): boolean {
        
        let ret = false;

        if (this.isShooting === false)
        {
            this.executeMovement();
        }

        if (this.move && this.checkArenaCollision()) {
            this.center.y += this.move ? (this.velocity.y * this.acceleration * delta) : 0;
            ret = true;
        }

        this.mana.update(this.tag, delta);
        this.energy.update(this.tag, delta);
    
        if (this.energy.energy <= 2) { this.keyPressed[this.keys.boost] = false; }

        if (this.effect !== undefined) {
            this.effect.update(delta, this);
        }
        if (this.shooter !== undefined) {
            this.shooter.update(delta, this);
        }
        return ret;
    }
}