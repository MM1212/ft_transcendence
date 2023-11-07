import * as PIXI from 'pixi.js';
import { GameObject } from './GameObject';
import { BallPolygon } from './Collisions/Polygon';
import { Vector2D } from './utils/Vector';
import { Player } from './Paddles/Player';
import { Bot } from './Paddles/Bot';
import { gameConfig, score } from './main';
import { Game } from './Game';
import { Bubble } from './SpecialPowers/Bubble';
import { ArenaWall } from './Collisions/Arena';

export class Ball extends GameObject {
    constructor(x: number, y: number, game: Game) {
        super('Bolinha', game);
        this.center = new Vector2D(x, y);
        this.startBall();
        this.acceleration = 1;
        this._move = true;
        this.height = gameConfig.ball.diameter;
        this.width = gameConfig.ball.diameter;
        this.collider.polygon = new BallPolygon(this.center, this.width, gameConfig.ball.vertices, []);
        this.collider.updateBoundingBox();
        this.collider.lastCollision = undefined;
        this.effect = undefined;
        this.effectVelocity = new Vector2D(1, 1);
    }

    getRandomVelocity(): Vector2D {
        const randX = (Math.random() * 3 + 3) * (Math.random() < 0.5 ? -1 : 1);
        const randY = (Math.random() * 1 + 3) * (Math.random() < 0.5 ? -1 : 1);
        return new Vector2D(randX, randY);
    }

    startBall(): void {
        this.setCenter(new Vector2D(this.game.width / 2, this.game.height / 2));
        this.game.applyOnAllObjects((obj) =>
            obj.collider.lastCollision !== false ? (obj.collider.lastCollision = undefined) : false
        );
        // todo: change this
        this.velocity = new Vector2D(7.5, -5.5).normalize().multiply(4);
        this.velocity = this.getRandomVelocity();
        this.acceleration = 1;
        this._move = true;
        if (this.effect !== undefined) this.effect?.setStopEffect();
    }

    resetBall(x: number): void {
        if (x <= 0) {
            const p2 = this.game.getObjectByTag('Player2');
            if (p2 && p2.getScale >= 0.82) {
                p2.setScale(p2.getScale - 0.02);
            }
            score[1] += 1;
        } else {
            const p1 = this.game.getObjectByTag('Player1');
            if (p1 && p1.getScale >= 0.82) {
                p1.setScale(p1.getScale - 0.02);
            }
            score[0] += 1;
        }
        this.startBall();
    }

    updatePolygon(newCenter: Vector2D): void {
        this.collider.polygon.update(newCenter);
        this.collider.updateBoundingBox();
    }

    update(delta: number): void {
        if (this.center.x <= 0 || this.center.x >= this.game.width) {
            this.resetBall(this.center.x);
        }
        if (this.center.y - this.height / 2 <= 0) {
            this.center.add(new Vector2D(0, 1));
        }
        if (this.center.y + this.height / 2 >= this.game.height) {
            this.center.add(new Vector2D(0, -1));
        }
        this.setCenter(
            new Vector2D(
                this.center.x + (this.move ? this.velocity.x * this.acceleration * delta : 0),
                this.center.y + (this.move ? this.velocity.y * this.acceleration * delta : 0)
            )
        );
        if (this.effect !== undefined) {
            this.effect.update(delta, this);
        }
    }

    // Nao esquecer de adicionar aqui os powers que tenham colisao com a bola
    onCollide(target: GameObject): void {
        this.collider.lastCollision = target.collider;
        if (target instanceof ArenaWall) {
            this.velocity.y = -this.velocity.y;
        } else if (target instanceof Player || target instanceof Bot || target instanceof Bubble) {
            // where the ball hit
            let collidePoint = this.getCenter.y - target.getCenter.y;
            // normalize the value
            collidePoint = collidePoint / (target.getHeight / 2);

            // calculate the angle in Radian
            const angleRad = collidePoint * (Math.PI / 4);

            // Determine the direction based on the current X velocity
            const direction = this.getVelocity.x > 0 ? -1 : 1;

            // Store the current speed (magnitude of velocity)
            const currentSpeed = Math.sqrt(this.getVelocity.x ** 2 + this.getVelocity.y ** 2);

            // Change the X and Y velocity direction
            this.getVelocity.x = currentSpeed * Math.cos(angleRad) * direction;
            this.getVelocity.y = currentSpeed * -Math.sin(angleRad);

            // Increase the ball speed
            if (this.acceleration < 2) this.setAcceleration(this.getAcceleration + 0.15);
            if (
                this.center.y <= target.getCenter.y - target.getHeight / 2 ||
                this.center.y >= target.getCenter.y + target.getHeight / 2
            ) {
                this.setVelocity(new Vector2D(-this.getVelocity.x, -this.getVelocity.y).multiply(this.effectVelocity));
                return;
            }
        }
    }
}

export class UIBall extends Ball {
    public displayObject: PIXI.Sprite;
    constructor(x: number, y: number, texture: PIXI.Texture, game: Game) {
        super(x, y, game);
        this.displayObject = PIXI.Sprite.from(texture);
        this.displayObject.anchor.set(0.5);
        this.displayObject.x = x;
        this.displayObject.y = y;

        // todo: color change
        const blueTranform = new PIXI.ColorMatrixFilter();
        blueTranform.hue(60, false);
        this.displayObject.filters = [blueTranform];
    }

    update(delta: number): void {
        super.update(delta);
        this.displayObject.x = this.center.x;
        this.displayObject.y = this.center.y;
    }

    onCollide(target: GameObject): void {
        super.onCollide(target);
    }
}
