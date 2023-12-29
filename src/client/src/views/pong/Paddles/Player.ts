import * as PIXI from "pixi.js";
import { Vector2D } from "../utils/Vector";
import { UIGame } from "../Game";
import { UIMana } from "./Mana";
import { UIEnergy } from "./Energy";
import { UIShooter } from "../SpecialPowers/Shooter";
import { Player } from "@shared/Pong/Paddles/Player";
import { UIBar } from "./Bar";
import { UIEffect } from "../SpecialPowers/Effect";
import PongModel from "@typings/models/pong";
import { paddleConfig } from "@shared/Pong/config/configInterface";
import { buildTexture } from "../utils";
import { computeUserAvatar } from "@utils/computeAvatar";
import { ARENA_SIZE, P_START_DIST } from "@shared/Pong/main";

export interface KeyControls {
  up: string;
  down: string;
  boost: string;
  shoot: string;
}

/* ------------------- Player ------------------- */

export class UIPlayer extends Player {
  public displayObject: PIXI.Sprite;
  public displayAvatar: PIXI.Sprite;
  public displayNickname: PIXI.Text;
  public nickTextFont = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xff0000,
    align: "center",
  });

  public mana: UIMana;
  public energy: UIEnergy;
  public shooter: UIShooter | undefined;
  public effect: UIEffect | undefined;

  constructor(
    x: number,
    y: number,
    public keys: KeyControls,
    tag: string,
    public direction: Vector2D,
    public specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    private uigame: UIGame,
    teamId: number,
    paddle: keyof typeof paddleConfig,
    avatar: string,
    public nickname: string,
    public userId: number
  ) {
    super(x, y, keys, tag, direction, specialPower, uigame, teamId, paddle);

    const paddleObj = paddleConfig[paddle];
    const texPath = PongModel.Endpoints.Targets.Connect.concat(
      "/".concat(paddleObj.image)
    );
    console.log("texPath: " + texPath);
    const tex = buildTexture(texPath);
    this.displayObject = new PIXI.Sprite(tex);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = this.center.x;
    this.displayObject.y = this.center.y;
    this.scale = 1;
    this.mana = new UIMana(tag, uigame);
    this.energy = new UIEnergy(tag, uigame);
    this.shooter = undefined;
    this.effect = undefined;
    this.displayAvatar = new PIXI.Sprite(
      buildTexture(computeUserAvatar(avatar))
    );
    this.displayAvatar.anchor.set(0.5);
    this.displayNickname = new PIXI.Text(nickname, this.nickTextFont);
    if (this.teamId === 0) {
      this.displayNickname.anchor.set(0, 0.5);
    }
    else {
      this.displayNickname.anchor.set(1, 0.5);
    }
    console.log("avatar: " + avatar);
    console.log("nickname: " + nickname);
    this.addUserInterface();
    console.log("avatarX: " + this.displayAvatar.x);
    console.log("avatarY: " + this.displayAvatar.y);
    console.log("nicknameX: " + this.displayNickname.x);
    console.log("nicknameY: " + this.displayNickname.y);
    this.displayAvatar.zIndex = 5;
    this.displayNickname.zIndex = 10;
    // add listeners for mana and energy updates
  }

  addUserInterface(): void {
    this.displayAvatar.width = ARENA_SIZE - (ARENA_SIZE / 5);
    this.displayAvatar.height = ARENA_SIZE - (ARENA_SIZE / 5);
    this.displayAvatar.y = ARENA_SIZE / 2;
    this.displayNickname.y = ARENA_SIZE / 2;
    if (this.teamId === 0) {
      this.displayAvatar.x = ARENA_SIZE / 2;
      this.displayNickname.x = this.displayAvatar.x + (this.displayAvatar.width / 2 + (this.displayAvatar.width / 4));
    } else {
      this.displayAvatar.x = this.uigame.width - ARENA_SIZE / 2;
      this.displayNickname.x = this.displayAvatar.x - (this.displayAvatar.width / 2 + (this.displayAvatar.width / 4));
    }
    if (this.tag === "Player 3" || this.tag === "Player 4") {
      this.displayAvatar.y = this.uigame.height - ARENA_SIZE / 2;
      this.displayNickname.y = this.uigame.height - ARENA_SIZE / 2;
    }
    this.uigame.app.stage.addChild(this.displayAvatar);
    this.uigame.app.stage.addChild(this.displayNickname);
  }

  updateEffect(effectName: string, effectValue: number): void {
    console.log(effectName + " " + effectValue);
    if (this.effect === undefined) {
      this.effect = new UIEffect(effectName, this);
      if (effectName === "INVISIBLE") {
        this.displayObject.alpha = 0;
      }
    } else {
      this.effect.update(effectValue, this);
    }
  }

  updateShooter(line: { start: number[]; end: number[] }): void {
    if (this.shooter !== undefined) {
      this.shooter.draw(line);
      this.displayObject.y = this.uigame.height / 2;
    }
  }

  shootPower(): void {
    if (this.shooter !== undefined) {
      this.shooter.shootBall(this);
      this.uigame.app.stage.removeChild(this.shooter?.displayObject);
    }
  }

  setDisplayObjectCoords(center: Vector2D): void {
    this.displayObject.x = center.x;
    this.displayObject.y = center.y;
  }

  createPower(
    specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    center: Vector2D,
    direction: number,
    shooter: UIBar,
    powertag: string
  ) {
    return UIBar.create(specialPower, center, direction, shooter, powertag);
  }

  setScaleDisplay(
    scale: number,
    height: number,
    width: number,
    x: number,
    y: number
  ): void {
    this.scale = scale;
    this.height = height;
    this.width = width;
    this.center.y = y;
    this.center.x = x;
    this.displayObject.height = height;
    this.displayObject.width = width;
    this.displayObject.x = x;
    this.displayObject.y = y;
    if (this.collider === undefined) return;
    this.collider.height = height;
    this.collider.width = width;
    this.updatePolygon(this.center);
  }

  update(): void {}
}
