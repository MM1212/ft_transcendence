import { GameObject } from "./GameObject";
import { BallPolygon } from "./Collisions/Polygon";
import { Vector2D } from "./utils/Vector";
// import { Bot } from './Paddles/Bot';
import { Game } from "./Game";
import { ballsConfig, gameConfig } from "./config/configInterface";
import { ArenaWall } from "./Collisions/Arena";
import { Bar } from "./Paddles/Bar";
import { Collider } from "./Collisions/Collider";
import PongModel from "../../typings/models/pong";

export class Ball extends GameObject {
  constructor(x: number, y: number, game: Game, ballSkinName: keyof typeof ballsConfig) {
    super(PongModel.InGame.ObjType.Ball, game);
    this.center = new Vector2D(x, y);
    this.startBall();
    this.acceleration = 1;
    this._move = true;
    console.log("ball skin: " + ballSkinName);
    this.height = ballsConfig[ballSkinName].diameter;
    this.width = ballsConfig[ballSkinName].diameter;

    this.collider = Collider.fromPolygon(
      new BallPolygon(this.center, this.width, ballsConfig[ballSkinName].vertices)
    );
    this.effect = undefined;
    this.effectVelocity = new Vector2D(1, 1);

    this.hasChanged = true;
  }

  getRandomVelocity(): Vector2D {
    const randX = (Math.random() * 3 + 3) * (Math.random() < 0.5 ? -1 : 1);
    const randY = (Math.random() * 1 + 3) * (Math.random() < 0.5 ? -1 : 1);
    return new Vector2D(randX, randY);
  }

  startBall(): void {
    this.setCenter(new Vector2D(this.game.width / 2, this.game.height / 2));
    this.game.applyOnAllObjects((obj) => {
      if (obj.collider === undefined) return;
      obj.collider.lastCollision = undefined;
    });
    // todo: change this
    this.velocity = new Vector2D(7.5, -5.5).normalize().multiply(4);
    this.velocity = this.getRandomVelocity();
    this.acceleration = 1;
    this._move = true;
    if (this.effect !== undefined) this.effect?.setStopEffect();
  }

  resetBall(x: number): void {
    if (x <= 0) {
      const p2 = this.game.getObjectByTag(
        PongModel.InGame.ObjType.Player2
      ) as Bar;
      if (p2) p2.reduceScale();
      const p4 = this.game.getObjectByTag(
        PongModel.InGame.ObjType.Player4
      ) as Bar;
      if (p4) p4.reduceScale();
      this.game.score[1] += 1;
    } else {
      const p1 = this.game.getObjectByTag(
        PongModel.InGame.ObjType.Player1
      ) as Bar;
      if (p1) p1.reduceScale();
      const p3 = this.game.getObjectByTag(
        PongModel.InGame.ObjType.Player3
      ) as Bar;
      if (p3) p3.reduceScale();
      this.game.score[0] += 1;
    }
    this.game.scored = true;
    this.startBall();
  }

  updatePolygon(newCenter: Vector2D): void {
    if (this.collider === undefined) return;
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
        this.center.x +
          (this.move ? this.velocity.x * this.acceleration * delta : 0),
        this.center.y +
          (this.move ? this.velocity.y * this.acceleration * delta : 0)
      )
    );
    if (this.effect !== undefined) {
      this.effect.update(delta, this);
    }
  }

  // Nao esquecer de adicionar aqui os powers que tenham colisao com a bola
  onCollide(target: GameObject): void {
    if (this.collider === undefined) return;
    this.collider.lastCollision = target.collider;
    if (target instanceof ArenaWall) {
      this.velocity.y = -this.velocity.y;
    } else if (target instanceof Bar) {
      // || target instanceof Bot) {
      // where the ball hit
      let collidePoint = this.getCenter.y - target.getCenter.y;
      // normalize the value
      collidePoint = collidePoint / (target.getHeight / 2);

      // calculate the angle in Radian
      const angleRad = collidePoint * (Math.PI / 4);

      // Determine the direction based on the current X velocity
      const direction = this.getVelocity.x > 0 ? -1 : 1;

      // Store the current speed (magnitude of velocity)
      const currentSpeed = Math.sqrt(
        this.getVelocity.x ** 2 + this.getVelocity.y ** 2
      );

      // Change the X and Y velocity direction
      this.getVelocity.x = currentSpeed * Math.cos(angleRad) * direction;
      this.getVelocity.y = currentSpeed * -Math.sin(angleRad);

      // Increase the ball speed
      if (this.acceleration < 2)
        this.setAcceleration(this.getAcceleration + 0.15);
      if (
        this.center.y <= target.getCenter.y - target.getHeight / 2 ||
        this.center.y >= target.getCenter.y + target.getHeight / 2
      ) {
        this.setVelocity(
          new Vector2D(-this.getVelocity.x, -this.getVelocity.y).multiply(
            this.effectVelocity
          )
        );
        return;
      }
    }
  }
}
