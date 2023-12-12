import { GameObject, effectSendOption } from "./GameObject";
import { Collider } from "./Collisions/Collider";
import { ETeamSide, IGameConfig } from "./config/configInterface";

export class Game {
  public run = true;
  public gameObjects: GameObject[] = [];
  protected remove_gameObjects: GameObject[] = [];
  protected collider_gameObjects: GameObject[] = [];
  protected keydown_gameObjects: GameObject[] = [];
  protected keyup_gameObjects: GameObject[] = [];
  protected gameconfig: IGameConfig;

  protected playerTags: string[] = [];

  public score: [number, number] = [0, 0];
  public sendScale: number = 1;
  protected sendObjects: GameObject[] = [];
  protected sendRemoveObjects: string[] = [];
  protected sendShooter: GameObject[] = [];
  protected sendEffects: GameObject[] = [];
  public sendTeamScored: ETeamSide | undefined = undefined;


  public delta: number = 0;

  // add array for changed objects to send to client

  constructor(public width: number, public height: number) {}

  // replicate pixijs game loop where the delta value has a maximum of 1 that means high performance or lower but approximate
  start() {}

  update(delta: number) {
    if (this.run) {
      //console.log(delta);
      this.sendTeamScored = undefined;
      this.sendObjects.length = 0;
      this.sendEffects.length = 0;
      this.sendShooter.length = 0;
      this.sendRemoveObjects.length = 0;
      this.gameObjects.forEach((gameObject: GameObject) => {
        gameObject.collider.reset()
        gameObject.effectSendOpt = effectSendOption.NONE;
      }
      );
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
        (gameObject: GameObject) => gameObject.effectSendOpt !== effectSendOption.NONE
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
  }

  public add(gameObject: GameObject) {
    this.gameObjects.push(gameObject);

    if (!!gameObject.onCollide)
      this.collider_gameObjects.push(gameObject);
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

  getObjectByTag(tag: string): GameObject | undefined {
    return this.gameObjects.find(
      (gameObject: GameObject) => gameObject.tag === tag
    );
  }
}