import * as PIXI from 'pixi.js';
import { UIGame } from '../Game';
import { Vector2D } from '../utils/Vector';
import { Mana } from '@shared/Pong/Paddles/Mana';
import PongModel from '@typings/models/pong';
import { buildTexture } from '../utils';
import { ARENA_SIZE } from '@shared/Pong/main';
import { BAR_SCALE } from './Display';

export class UIMana extends Mana {
  public manaBar: PIXI.Graphics;

  public displayMana: PIXI.Sprite[] = [];

  constructor(
    private readonly game: UIGame,
    readonly position: number
  ) {
    super();
    this.manaBar = new PIXI.Graphics();
    this.printMana();

    const invertx = position === 1 || position === 3 ? -1 : 1;
const inverty = position === 2 || position === 3 ? -1 : 1;
    const center: Vector2D = this.getManaBarPosition(position);
    let i = 0;
    // loads all manabars and sets them to invisible
    while (i <= 4) {
      this.displayMana.push(
        new PIXI.Sprite(
          buildTexture(
            PongModel.Endpoints.Targets.ManaBars.concat(`/Mana${i}.png`)
          )
        )
      );
      this.displayMana[i].zIndex = 15 - i;
      this.displayMana[i].scale.y = inverty * BAR_SCALE;
      this.displayMana[i].scale.x = invertx * BAR_SCALE;
      this.displayMana[i].x = center.x;
      this.displayMana[i].y = center.y;
      this.displayMana[i].alpha = 0;
      if (i === 0) this.displayMana[i].alpha = 1;
      this.game.app.stage.addChild(this.displayMana[i]);
      i++;
    }
  }

  printMana(): void {
    const manaThresholds = [0.8, 0.6, 0.4, 0.2, 0];

    for (let i = 0; i < this.displayMana.length; i++) {
      this.displayMana[i].alpha =
        this.manaCur >= this.manaMax * manaThresholds[i] ? 1 : 0;
    }
  }

  // TODO change these values
  getManaBarPosition(positionN: number): Vector2D {
    const position: Vector2D = new Vector2D(0, 0);
    switch (positionN) {
      case 0:
        position.x = ARENA_SIZE - 14;
        position.y = ARENA_SIZE - ARENA_SIZE / 3 + 9;
        break;
      case 1:
        position.x = this.game.width - ARENA_SIZE +13;
        position.y = ARENA_SIZE - ARENA_SIZE / 3 + 9;
        break;
      case 2:
        position.x = ARENA_SIZE - 14;
        position.y = this.game.height - ARENA_SIZE + 24;
        break;
      case 3:
        position.x = this.game.width - ARENA_SIZE +15;
        position.y = this.game.height - ARENA_SIZE + 25;
        break;
    }
    return position;
  }

  updateMana(mana: number): void {
    this.manaCur = mana;
    this.printMana();
  }

  destroy() {
    this.displayMana.forEach((mana) => {
      this.game.app.stage.removeChild(mana);
    });
  }

  update(): void {
    this.printMana();
  }
}
