import { GameObject } from './GameObject';
import { Collider } from './Collisions/Collider';
import { IGameConfig } from './config/configInterface';

export class Game {
    public run = true;
    public gameObjects: GameObject[] = [];
    protected remove_gameObjects: GameObject[] = [];
    protected collider_gameObjects: GameObject[] = [];
    protected keydown_gameObjects: GameObject[] = [];
    protected keyup_gameObjects: GameObject[] = [];
    protected gameconfig: IGameConfig;

    public delta: number = 0;

    // add array for changed objects to send to client

    constructor(public width: number, public height: number) {}

    handleKeyDown = (e: KeyboardEvent) => {
        this.keydown_gameObjects.forEach((gameObject: GameObject) => {
            if (gameObject?.onKeyDown != undefined) {
                gameObject.onKeyDown.bind(gameObject)(e);
            }
        });
        if (e.key === 't') {
            this.getObjectByTag('Bolinha')?.setMove(!this.run);
            this.run = !this.run;
        }
    };
    handleKeyUp = (e: KeyboardEvent) => {
        this.keyup_gameObjects.forEach((gameObject: GameObject) => {
            if (gameObject?.onKeyUp) gameObject.onKeyUp.bind(gameObject)(e);
        });
    };

    // replicate pixijs game loop where the delta value has a maximum of 1 that means high performance or lower but approximate
    start() {
        
    }

    update(delta: number) {
        if (this.run) {
            //console.log(delta);
            this.gameObjects.forEach((gameObject: GameObject) => gameObject.collider.reset());
            this.collider_gameObjects.forEach((target: GameObject) => {
                this.gameObjects.forEach((gameObject: GameObject) => {
                    if (target != gameObject) Collider.collidingObjects(gameObject, target);
                });
            });
            this.gameObjects.forEach((gameObject: GameObject) => {
                gameObject.update(delta);
            });
            if (this.remove_gameObjects.length > 0) this.removeObjects();
        }
    }

    shutdown() {
        this.gameObjects.forEach((gameObject: GameObject) => gameObject?.onDestroy?.());
        this.gameObjects.length = 0;
        this.collider_gameObjects.length = 0;
        this.keydown_gameObjects.length = 0;
        this.keyup_gameObjects.length = 0;
        this.remove_gameObjects.length = 0;
    }

    public add(gameObject: GameObject) {
        this.gameObjects.push(gameObject);
        if (gameObject?.onCollide != undefined) this.collider_gameObjects.push(gameObject);
        if (gameObject?.onKeyDown != undefined) this.keydown_gameObjects.push(gameObject);
        if (gameObject?.onKeyUp != undefined) this.keyup_gameObjects.push(gameObject);
    }

    public remove(gameObject: GameObject) {
        this.remove_gameObjects.push(gameObject);
    }

    protected removeObjects() {
        this.collider_gameObjects = this.collider_gameObjects.filter(
            (value: GameObject) => !this.remove_gameObjects.includes(value)
        );
        this.keydown_gameObjects = this.keydown_gameObjects.filter(
            (value: GameObject) => !this.remove_gameObjects.includes(value)
        );
        this.keyup_gameObjects = this.keyup_gameObjects.filter(
            (value: GameObject) => !this.remove_gameObjects.includes(value)
        );
        this.gameObjects = this.gameObjects.filter((value: GameObject) => !this.remove_gameObjects.includes(value));
        this.remove_gameObjects.forEach((gameObject: GameObject) => gameObject?.onDestroy?.());
        this.remove_gameObjects.length = 0;
    }

    public applyOnAllObjects(func: (gameObject: GameObject) => void) {
        this.gameObjects.forEach((gameObject: GameObject) => {
            func(gameObject);
        });
    }

    getObjectByTag(tag: string): GameObject | undefined {
        return this.gameObjects.find((gameObject: GameObject) => gameObject.tag === tag);
    }
}
