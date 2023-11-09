import { Ball } from "../Ball";
import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";


export class Effect {
    protected effectCur: number;
    protected effectMax: number;
    protected effectType: string;
    
    constructor(effectName: string, target: GameObject) {
        this.effectCur = 0;
        this.effectMax = 100;
        this.effectType = effectName;
        target.increaseHitAmount();
        switch (this.effectType) {
            case 'SLOW':
                this.effectMax = 120;
                target.setEffectVelocity(new Vector2D(0, 0.5));
                break;
            case 'STOP':
                this.effectMax = this.effectCur + 80;
                target.setEffectVelocity(new Vector2D(0, 0));
                break;
            case 'REVERSE':
                this.effectMax = 200;
                target.setEffectVelocity(new Vector2D(0, -1));
                break;
            case 'CANNON':
                this.effectMax = 150;
                target.setEffectVelocity(new Vector2D(1, 1));
                break;
            case 'INVISIBLE':
                this.effectMax = 50;
                target.setEffectVelocity(new Vector2D(1, 1));
                break;
            default:
                this.effectMax = 100;
                break;
        }
    }

    get effect(): number {
        return this.effectCur;
    }

    get effectMaxVal(): number {
        return this.effectMax;
    }

    get name(): string {
        return this.effectType;
    }

    setStopEffect(): void {
        this.effectCur = this.effectMax;
    }

    get isEffectOver(): boolean {
        return this.effectCur >= this.effectMax;
    }

    update(delta: number, obj: GameObject): void {
        this.effectCur += delta * 0.5;
        if (this.effectCur >= this.effectMax) {
            obj.decreaseHitAmount();
            console.log("decrease hit amount");
            if (obj.hitAmountEffect <= 0)
            {
                obj.setEffectVelocity(new Vector2D(0, 1));
                if (obj instanceof Ball)
                {
                    obj.setEffectVelocity(new Vector2D(1, 1));
                }
                obj.setEffect(undefined);
            }
        }
    }
}
