import { Bot } from "@shared/Pong/Paddles/Bot";
import { Vector2D } from "../utils/Vector";
import { UIGame } from "../Game";

import * as PIXI from "pixi.js";
import PongModel from "@typings/models/pong";
import { paddleConfig } from "@shared/Pong/config/configInterface";
import { buildTexture } from "../utils";
import { UIEffect } from "../SpecialPowers/Effect";
import { UIShooter } from "../SpecialPowers/Shooter";
import { UIBar } from "./Bar";
import Display from "./Display";

export class UIBot extends Bot {
  public displayObject: PIXI.Sprite;

  public shooter: UIShooter | undefined;
  public effect: UIEffect | undefined;
  public display: Display;
  constructor(
    x: number,
    y: number,
    public tag: string,
    public direction: Vector2D,
    public specialPower: PongModel.Models.LobbyParticipantSpecialPowerType,
    public uigame: UIGame,
    public teamId: number,
    paddle: keyof typeof paddleConfig,
    avatar: string,
    public nickname: string,
    public userId: number
  ) {
    super(x, y, tag, direction, specialPower, uigame, teamId, paddle, userId);

    const paddleObj = paddleConfig[paddle];
    const texPath = PongModel.Endpoints.Targets.Connect.concat(
      "/".concat(paddleObj.image)
    );

    const tex = buildTexture(texPath);
    this.displayObject = PIXI.Sprite.from(tex);
    this.displayObject.anchor.set(0.5);
    this.displayObject.x = x;
    this.displayObject.y = y;
    this.scale = 1;

    this.shooter = undefined;
    this.effect = undefined;

    this.display = new Display(nickname, avatar, uigame, tag);

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
