import * as PIXI from 'pixi.js';
import { UIGame } from '../Game';
import { Vector2D } from '../utils/Vector';
import { Energy } from '@shared/Pong/Paddles/Energy';
import PongModel from '@typings/models/pong';

export class UIEnergy extends Energy {
  public energyBar: PIXI.Graphics;

  constructor(
    player: string,
    private readonly game: UIGame
  ) {
    super();
    this.energyBar = new PIXI.Graphics();
    this.energyBar.zIndex = 15;
    this.printEnergy(player);
  }

  getEnergyBarPosition(player: string): Vector2D {
    const position: Vector2D = new Vector2D(0, 0);

    if (player === PongModel.InGame.ObjType.Player1) {
      position.x = 10;
      position.y = 18;
    } else if (player === PongModel.InGame.ObjType.Player2) {
      position.x = this.game.width - this.energyMax - 10;
      position.y = 18;
    } else if (player === PongModel.InGame.ObjType.Player3) {
      position.x = 10;
      position.y = 40;
    } else if (player === PongModel.InGame.ObjType.Player4) {
      position.x = this.game.width - this.energyMax - 10;
      position.y = 40;
    }
    return position;
  }

  printEnergy(player: string): void {
    const energyBarPosition = this.getEnergyBarPosition(player);
    this.energyBar.clear();
    this.energyBar.x = energyBarPosition.x;
    this.energyBar.y = energyBarPosition.y;

    this.energyBar.beginFill(0xffff00);
    this.energyBar.drawRect(0, 0, this.energy, 8);
    this.energyBar.endFill();
    if (this.energy < this.energyMax) {
      this.energyBar.beginFill(0xffa500);
      this.energyBar.drawRect(this.energy, 0, this.energyMax - this.energy, 8);
      this.energyBar.endFill();
    }
    this.game.app.stage.addChild(this.energyBar);
  }

  updateEnergy(energy: number, tag: string): void {
    this.energyCur = energy;
    this.printEnergy(tag);
  }

  update(player: string, delta: number): void {
    this.printEnergy(player);
  }
}
