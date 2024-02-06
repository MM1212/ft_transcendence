import * as PIXI from 'pixi.js';
import { buildTexture } from '../utils';
import { computeUserAvatar } from '@utils/computeAvatar';
import PongModel from '@typings/models/pong';
import { ARENA_SIZE } from '@shared/Pong/main';
import type { UIGame } from '../Game';
import { UIMana } from './Mana';
import { UIEnergy } from './Energy';

export const BAR_SCALE = 2;

export default class Display {
  public displayAvatar: PIXI.Sprite;
  public displayNickname: PIXI.Text;
  public displayBorder: PIXI.Sprite;
  public displayPower: PIXI.Sprite | undefined = undefined;
  public nickTextFont = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xff0000,
    align: 'center',
  });
  public mana: UIMana | undefined = undefined;
  public energy: UIEnergy | undefined = undefined;

  public position: number = 0;

  constructor(
    nickname: string,
    avatar: string,
    private uigame: UIGame,
    tag: string
  ) {
    switch (tag) {
      case PongModel.InGame.ObjType.Player1:
        this.position = 0;
        break;
      case PongModel.InGame.ObjType.Player2:
        this.position = 1;
        break;
      case PongModel.InGame.ObjType.Player3:
        this.position = 2;
        break;
      case PongModel.InGame.ObjType.Player4:
        this.position = 3;
        break;
    }

    let random = Math.floor(Math.random() * 9) + 1;
    while (this.uigame.randomBordersSelected.includes(random)) {
      random = Math.floor(Math.random() * 9) + 1;
    }
    this.uigame.randomBordersSelected.push(random);

    this.displayBorder = new PIXI.Sprite(
      buildTexture(
        PongModel.Endpoints.Targets.Borders.concat(`/Border${random}.png`)
      )
    );
    this.displayBorder.anchor.set(0.5);
    this.displayBorder.width = ARENA_SIZE;
    this.displayBorder.height = ARENA_SIZE;
    this.displayBorder.zIndex = 20;
    this.uigame.app.stage.addChild(this.displayBorder);

    this.displayAvatar = new PIXI.Sprite(
      buildTexture(computeUserAvatar(avatar))
    );
    this.displayAvatar.anchor.set(0.5);
    this.displayNickname = new PIXI.Text(nickname, this.nickTextFont);
    if (this.position % 2 === 0) {
      this.displayNickname.anchor.set(0, 0.5);
    } else {
      this.displayNickname.anchor.set(1, 0.5);
    }
    this.addUserInterface();

    this.mana = new UIMana(uigame, this.position);
    this.energy = new UIEnergy(uigame, this.position);
  }

  addUserInterface() {
    this.displayAvatar.y = ARENA_SIZE / 2;
    this.displayNickname.y = ARENA_SIZE / 1.75;
    if (this.position === 0 || this.position === 2) {
      this.displayAvatar.x = ARENA_SIZE / 2;
      this.displayNickname.x = this.displayAvatar.x + ARENA_SIZE / 1.75;
    } else {
      this.displayAvatar.x = this.uigame.width - ARENA_SIZE / 2;
      this.displayNickname.x = this.displayAvatar.x - ARENA_SIZE / 1.75;
    }
    if (this.position > 1) {
      this.displayAvatar.y = this.uigame.height - ARENA_SIZE / 2;
      this.displayNickname.y = this.uigame.height - ARENA_SIZE / 1.75;
    }
    this.displayBorder.x = this.displayAvatar.x;
    this.displayBorder.y = this.displayAvatar.y;
    this.displayAvatar.width = ARENA_SIZE - ARENA_SIZE / 3 + 12;
    this.displayAvatar.height = ARENA_SIZE - ARENA_SIZE / 3 + 12;
    this.displayAvatar.zIndex = 5;
    this.displayNickname.zIndex = 7;
    this.uigame.app.stage.addChild(this.displayAvatar);
    this.uigame.app.stage.addChild(this.displayNickname);
  }
}
