import Vector2D from '../Vector/Vector2D';
import type { PNG } from 'pngjs';
import { IClassLifeCycle } from './utils';
import { IS_SERVER } from './constants';

export abstract class Collision implements IClassLifeCycle {
  protected mapCollision: PNG | null = null;
  public constructor() {}

  abstract onMount(): Promise<void>;

  protected getPixelColor(position: Vector2D): number {
    if (!this.mapCollision) return 0;
    const address = (this.mapCollision.width * position.y + position.x) << 2;
    const r = this.mapCollision.data[address];
    const g = this.mapCollision.data[address + 1];
    const b = this.mapCollision.data[address + 2];
    const a = this.mapCollision.data[address + 3];
    return (r << 24) | (g << 16) | (b << 8) | a;
  }
  isPositionValid(position: Vector2D): boolean {
    // if (IS_SERVER) {
    //   console.log(
    //     'collision check',
    //     position.toObject(),
    //     !!this.mapCollision,
    //     this.mapCollision &&
    //       new Vector2D(this.mapCollision?.width, this.mapCollision?.height)
    //   );
    // }
    if (!this.mapCollision) return false;
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.mapCollision.width ||
      position.y >= this.mapCollision.height
    )
      return false;
    const pixel = this.getPixelColor(position.floor());
    const a = pixel & 0xff;
    return a !== 0;
  }
}
