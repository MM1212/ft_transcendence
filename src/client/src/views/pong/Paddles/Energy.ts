import * as PIXI from 'pixi.js';
import { UIGame } from '../Game';
import { Vector2D } from '../utils/Vector';
import { Energy } from '@shared/Pong/Paddles/Energy';
import PongModel from '@typings/models/pong';
import { buildTexture } from '../utils';
import { ARENA_SIZE } from '@shared/Pong/main';
import { BAR_SCALE } from './Display';

export class UIEnergy extends Energy {
  public energyBar: PIXI.Graphics;

  public displayEnergy: PIXI.Sprite[] = [];

  constructor(
    private readonly game: UIGame,
    readonly position: number
  ) {
    super();
    this.energyBar = new PIXI.Graphics();
    this.energyBar.zIndex = 15;
    this.printEnergy();

    const invertx = position === 1 || position === 3 ? -1 : 1;
    const inverty = position === 2 || position === 3 ? -1 : 1;
    const center: Vector2D = this.getEnergyBarPosition(position);
    let i = 0;
    // loads all energybars and sets them to invisible
    while (i <= 4) {
      this.displayEnergy.push(
        new PIXI.Sprite(
          buildTexture(
            PongModel.Endpoints.Targets.EnergyBars.concat(`/Energy${i}.webp`)
          )
        )
      );
      this.displayEnergy[i].zIndex = 15 - i;
      this.displayEnergy[i].scale.y = inverty * BAR_SCALE;
      this.displayEnergy[i].scale.x = invertx * BAR_SCALE;
      this.displayEnergy[i].x = center.x;
      this.displayEnergy[i].y = center.y;
      this.displayEnergy[i].alpha = 0;
      if (i === 0) this.displayEnergy[i].alpha = 1;
      this.game.app.stage.addChild(this.displayEnergy[i]);
      i++;
    }
  }

  printEnergy(): void {
    const energyThresholds = [0.8, 0.6, 0.4, 0.2, 0];

    for (let i = 0; i < this.displayEnergy.length; i++) {
      this.displayEnergy[i].alpha =
        this.energyCur >= this.energyMax * energyThresholds[i] ? 1 : 0;
    }
  }

  // TODO change these values
  getEnergyBarPosition(positionN: number): Vector2D {
    const position: Vector2D = new Vector2D(0, 0);
    switch (positionN) {
      case 0:
        position.x = ARENA_SIZE - 25;
        position.y = ARENA_SIZE - ARENA_SIZE / 3 + 21;
        break;
      case 1:
        position.x = this.game.width - ARENA_SIZE + 24;
        position.y = ARENA_SIZE - ARENA_SIZE / 3 + 21;
        break;
      case 2:
        position.x = ARENA_SIZE - 25;
        position.y = this.game.height - ARENA_SIZE + 11;
        break;
      case 3:
        position.x = this.game.width - ARENA_SIZE + 26;
        position.y = this.game.height - ARENA_SIZE + 12;
        break;
    }
    return position;
  }

  updateEnergy(energy: number): void {
    this.energyCur = energy;
    this.printEnergy();
  }

  destroy() {
    this.displayEnergy.forEach((energy) => {
      this.game.app.stage.removeChild(energy);
    });
  }

  update(): void {
    this.printEnergy();
  }
}
