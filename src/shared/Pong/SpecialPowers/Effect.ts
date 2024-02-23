import { Ball } from "../Ball";
import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";

export class Effect {
  public effectCur: number;
  protected effectMax: number;
  public effectType: string;

  constructor(effectName: string, target: GameObject) {
    this.effectCur = 0;
    this.effectMax = 100;
    this.effectType = effectName;
    const effects: { [key: string]: { duration: number; velocity: Vector2D } } =
      {
        "SLOW": { duration: 120, velocity: new Vector2D(0, 0.5) },
        "STOP": { duration: this.effectCur + 80, velocity: new Vector2D(0, 0) },
        "REVERSE": { duration: 200, velocity: new Vector2D(0, -1) },
        "CANNON": { duration: 150, velocity: new Vector2D(1, 1) },
        "INVISIBLE": { duration: 25, velocity: new Vector2D(1, 1) },
        "default": { duration: 100, velocity: new Vector2D(1, 1) },
      };
    target.increaseHitAmount();
    const effect = effects[effectName] || effects["default"];
    this.effectMax = effect.duration;
    target.setEffectVelocity(effect.velocity);
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
    this.effectCur = this.effectMax + 10;
  }

  get isEffectOver(): boolean {
    return this.effectCur >= this.effectMax;
  }

  update(delta: number, obj: GameObject): void {
    this.effectCur += delta * 0.5;
    if (this.effectCur >= this.effectMax) {
      obj.decreaseHitAmount();
      if (obj.hitAmountEffect <= 0) {
        obj.setEffectVelocity(new Vector2D(0, 1));
        if (obj instanceof Ball) {
          obj.setEffectVelocity(new Vector2D(1, 1));
        }
        obj.setEffect(undefined);
      }
    }
  }
}
