import * as PIXI from 'pixi.js';
import { UIGame } from '../Game';
import { Vector2D } from '../utils/Vector';
import { Mana } from '@shared/Pong/Paddles/Mana';
import PongModel from '@typings/models/pong';

export class UIMana extends Mana {
    public manaBar: PIXI.Graphics;
    constructor(player: string, private readonly game: UIGame) {
        super();
        this.manaBar = new PIXI.Graphics();
        this.printMana(player);
    }

    printMana(player: string): void {

        const manaBarPosition = this.getManaBarPosition(player);
        this.manaBar.clear();
        this.manaBar.x = manaBarPosition.x;
        this.manaBar.y = manaBarPosition.y;
        this.manaBar.zIndex = 15;

        this.manaBar.beginFill(0x0000FF);
        this.manaBar.drawRect(0, 0, this.mana, 8);
        this.manaBar.endFill();
        if (this.mana < this.manaMax)
        {
            this.manaBar.beginFill(0xFF0000);
            this.manaBar.drawRect(this.mana, 0, this.manaMax - this.mana, 8);
            this.manaBar.endFill();
        }
        this.game.app.stage.addChild(this.manaBar);
    }

    getManaBarPosition(player: string): Vector2D {
        const position: Vector2D = new Vector2D(0, 0);

        if (player === PongModel.InGame.ObjType.Player1){
            position.x = 10;
            position.y = 10;
        }
        else if (player === PongModel.InGame.ObjType.Player2)
        {
            position.x = this.game.width - this.manaMax - 10;
            position.y = 10;
        }
        else if (player === PongModel.InGame.ObjType.Player3)
        {
            position.x = 10;
            position.y = 32;
        }
        else if (player === PongModel.InGame.ObjType.Player4)
        {
            position.x = this.game.width - this.manaMax - 10;
            position.y = 32;
        }
        return position;
    }

    updateMana(mana: number, tag: string): void {
        this.manaCur = mana;
        this.printMana(tag);
    }

    update(player: string, delta: number): void {
        this.printMana(player);
    }
}
