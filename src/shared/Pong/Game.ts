import { GameObject } from './GameObject';
import { Collider } from './Collisions/Collider';

/**
 *
 *  HARDCODE
 *
 */

export class Game {
    public run = true;
    public gameObjects: GameObject[] = [];
    protected remove_gameObjects: GameObject[] = [];
    protected collider_gameObjects: GameObject[] = [];
    protected keydown_gameObjects: GameObject[] = [];
    protected keyup_gameObjects: GameObject[] = [];

    public delta: number = 0;

    // add array for changed objects to send to client

    constructor(public width: number, public height: number) {
        //const p1 = new Player(
        //    P_START_DIST,
        //    height / 2,
        //    keys1,
        //    'Player1',
        //    new Vector2D(1, 1),
        //    gameConfig.p1.specialPower as SpecialPowerType,
        //    this
        //);
        //this.add(p1);
        //const p2 = new Player(
        //    width - P_START_DIST,
        //    height / 2,
        //    keys2,
        //    'Player2',
        //    new Vector2D(-1, 1),
        //    'Bubble',
        //    this
        //);
        //this.add(p2);
        ////this.add(new Bot(P2Tex, this.app.view.width - P_START_DIST, this.app.view.height / 2, 'Player2', new Vector2D(-1, 1)));
        ////this.add(new Bot(P2Tex, MULTIPLAYER_START_POS, this.app.view.height / 2, 'Player3', new Vector2D(-1, 1)));
        ////this.add(new Bot(P2Tex, this.app.view.width - MULTIPLAYER_START_POS, this.app.view.height / 2, 'Player4', new Vector2D(-1, 1)));
        //this.add(new ArenaWall(new Vector2D(0, 0), new Vector2D(width, ARENA_SIZE), 0x00abff, this));
        //this.add(new ArenaWall(new Vector2D(0, height - ARENA_SIZE),new Vector2D(width, ARENA_SIZE),0x00abff,this));
        //this.add(new Ball(width / 2, height / 2, this));
        //document.addEventListener('keydown', this.handleKeyDown);
        //document.addEventListener('keyup', this.handleKeyUp);
    }

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
        let lastTimeStamp = performance.now();
        let accFrames = 0;
        let lastFPSTimestamp = performance.now();
        const fixedDeltaTime: number = 0.01667; // 60 FPS in seconds
        const tick = () => {
            const timestamp = performance.now();
            const deltaTime = (timestamp - lastTimeStamp) / 1000;
            accFrames ++;
            lastTimeStamp = timestamp;
            this.delta = deltaTime / fixedDeltaTime
            this.update(this.delta);
            if (timestamp - lastFPSTimestamp > 1000) {
                //console.log(accFrames);
                accFrames = 0;
                lastFPSTimestamp = timestamp;
            }
            //requestAnimationFrame(tick);
        };
        setInterval(tick, 3);
        //requestAnimationFrame(tick);
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
