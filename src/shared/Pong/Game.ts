import { GameObject, effectSendOption } from "./GameObject";
import { Collider } from "./Collisions/Collider";
import { GameStatistics } from "./Stats/GameStats";
import PongModel from "../../typings/models/pong";

export class Game {
  public run = true;
  public gameObjects: GameObject[] = [];
  private ballRef: GameObject | undefined;
  protected remove_gameObjects: GameObject[] = [];
  protected collider_gameObjects: GameObject[] = [];
  protected keydown_gameObjects: GameObject[] = [];
  protected keyup_gameObjects: GameObject[] = [];

  public score: [number, number] = [0, 0];
  public sendPaddlesScale: GameObject[] = [];
  protected sendObjects: GameObject[] = [];
  protected sendRemoveObjects: string[] = [];
  protected sendShooter: GameObject[] = [];
  public sendShooterTimeout: string = "";
  protected sendEffects: GameObject[] = [];
  public scored: boolean = false;

  public gamemode: PongModel.Models.LobbyGameType = PongModel.Models.LobbyGameType.Powers;

  public gameStats: GameStatistics = new GameStatistics();

  public delta: number = 0;

  constructor(public width: number, public height: number, gametype: PongModel.Models.LobbyGameType) {
    this.gamemode = gametype;
  }

  start() {}

  private zeroS(): void {
    this.scored = false;
    this.sendObjects.length = 0;
    this.sendEffects.length = 0;
    this.sendShooter.length = 0;
    this.sendRemoveObjects.length = 0;
    this.sendPaddlesScale.length = 0;
    this.gameObjects.forEach((gameObject: GameObject) => {
      gameObject.collider?.reset();
      gameObject.effectSendOpt = effectSendOption.NONE;
    });
  }

  update(delta: number) {
    if (this.run) {
      this.zeroS();
      this.collider_gameObjects.forEach((target: GameObject) => {
        this.gameObjects.forEach((gameObject: GameObject) => {
          if (target != gameObject)
            Collider.collidingObjects(gameObject, target);
        });
      });
      this.gameObjects.forEach((gameObject: GameObject) => {
        gameObject.update(delta);
      });
      this.sendObjects = this.gameObjects.filter(
        (gameObject: GameObject) => gameObject.hasChanged
      );
      this.sendShooter = this.gameObjects.filter(
        (gameObject: GameObject) => gameObject.hasChangedShooter
      );
      this.sendEffects = this.gameObjects.filter(
        (gameObject: GameObject) =>
          gameObject.effectSendOpt !== effectSendOption.NONE
      );
      if (this.remove_gameObjects.length > 0) this.removeObjects();
    }
  }

  shutdown() {
    this.gameObjects.forEach((gameObject: GameObject) =>
      gameObject?.onDestroy?.()
    );
    this.gameObjects.length = 0;
    this.collider_gameObjects.length = 0;
    this.remove_gameObjects.length = 0;
    this.sendObjects.length = 0;
    this.sendRemoveObjects.length = 0;
    this.sendEffects.length = 0;
    this.sendShooter.length = 0;
    this.sendShooterTimeout = "";
    this.sendPaddlesScale.length = 0;
  }

  public add(gameObject: GameObject) {
    this.gameObjects.push(gameObject);

    if (!!gameObject.onCollide) this.collider_gameObjects.push(gameObject);
    if (gameObject.tag === PongModel.InGame.ObjType.Ball)
      this.ballRef = gameObject;
  }

  public remove(gameObject: GameObject) {
    this.remove_gameObjects.push(gameObject);
    this.sendRemoveObjects.push(gameObject.tag);
  }

  protected removeObjects() {
    this.collider_gameObjects = this.collider_gameObjects.filter(
      (value: GameObject) => !this.remove_gameObjects.includes(value)
    );
    this.gameObjects = this.gameObjects.filter(
      (value: GameObject) => !this.remove_gameObjects.includes(value)
    );
    this.remove_gameObjects.forEach((gameObject: GameObject) =>
      gameObject?.onDestroy?.()
    );
    this.remove_gameObjects.length = 0;
  }

  public applyOnAllObjects(func: (gameObject: GameObject) => void) {
    this.gameObjects.forEach((gameObject: GameObject) => {
      func(gameObject);
    });
  }

  public getObjectByTag(tag: string): GameObject | undefined {
    if (tag === PongModel.InGame.ObjType.Ball && this.ballRef)
      return this.ballRef;
    return this.gameObjects.find(
      (gameObject: GameObject) => gameObject.tag === tag
    );
  }
}
