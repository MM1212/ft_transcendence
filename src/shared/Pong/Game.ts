import { GameObject } from "./GameObject";
import { Collider } from "./Collisions/Collider";
import { IGameConfig } from "./config/configInterface";

export class Game {
  public run = true;
  public gameObjects: GameObject[] = [];
  protected remove_gameObjects: GameObject[] = [];
  protected collider_gameObjects: GameObject[] = [];
  protected keydown_gameObjects: GameObject[] = [];
  protected keyup_gameObjects: GameObject[] = [];
  protected gameconfig: IGameConfig;

  protected sendObjects: GameObject[] = [];

  public delta: number = 0;

  // add array for changed objects to send to client

  constructor(public width: number, public height: number) {}

  // replicate pixijs game loop where the delta value has a maximum of 1 that means high performance or lower but approximate
  start() {}

  update(delta: number) {
    if (this.run) {
      //console.log(delta);
      this.sendObjects.length = 0;
      this.gameObjects.forEach((gameObject: GameObject) =>
        gameObject.collider.reset()
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
  }

  public add(gameObject: GameObject) {
    this.gameObjects.push(gameObject);
    console.log(
      "adding obg",
      gameObject.tag,
      "with collider?",
      gameObject.onCollide,
      gameObject.collider.enabled
    );

    if (!!gameObject.onCollide)
      this.collider_gameObjects.push(gameObject);
  }

  public remove(gameObject: GameObject) {
    this.remove_gameObjects.push(gameObject);
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
