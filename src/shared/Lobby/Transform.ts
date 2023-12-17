import Vector2D from '../Vector/Vector2D';
import { IClassLifeCycle } from './utils';
import { vector2 } from '../../typings/vector';
import { LobbyModel } from './types';

export class Transform
  implements LobbyModel.Models.ITransform, IClassLifeCycle
{
  public position: Vector2D;
  public direction: Vector2D;
  constructor(position: vector2, direction: vector2, public speed: number) {
    this.position = new Vector2D(position);
    this.direction = new Vector2D(direction);
  }

  async destructor(): Promise<void> {}
  async onMount(): Promise<void> {}
  async onUpdate(delta: number): Promise<void> {
    if (this.speed === 0) return;
    const velocity = this.direction.normalize().multiply(this.speed * delta);
    if (velocity.NaN) return;
    this.position = this.position.add(velocity);
  }

  public toObject(): LobbyModel.Models.ITransform {
    return {
      position: this.position.toObject(),
      direction: this.direction.toObject(),
      speed: this.speed,
    };
  }
}
