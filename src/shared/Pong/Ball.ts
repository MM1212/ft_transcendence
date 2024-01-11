import { GameObject } from './GameObject';
import { BallPolygon } from './Collisions/Polygon';
import { Vector2D } from './utils/Vector';
// import { Bot } from './Paddles/Bot';
import { Game } from './Game';
import { ballsConfig, gameConfig } from './config/configInterface';
import { ArenaWall } from './Collisions/Arena';
import { Bar } from './Paddles/Bar';
import { Collider } from './Collisions/Collider';
import PongModel from '../../typings/models/pong';
import { SpecialPower } from './SpecialPowers/SpecialPower';
import { Bubble } from './SpecialPowers/Bubble';
import { Fire } from './SpecialPowers/Fire';

export class Ball extends GameObject {
  public powerScoredTheGoal: SpecialPower | undefined;
  public lastPlayerToTouch: Bar | undefined;

  constructor(
    x: number,
    y: number,
    game: Game,
    ballSkinName: keyof typeof ballsConfig
  ) {
    super(PongModel.InGame.ObjType.Ball, game);
    this.center = new Vector2D(x, y);
    this.startBall();
    this.acceleration = 1;
    this._move = true;
    console.log('ball skin: ' + ballSkinName);
    this.height = ballsConfig[ballSkinName].diameter;
    this.width = ballsConfig[ballSkinName].diameter;

    this.collider = Collider.fromPolygon(
      new BallPolygon(
        this.center,
        this.width,
        ballsConfig[ballSkinName].vertices
      )
    );
    this.effect = undefined;
    this.effectVelocity = new Vector2D(1, 1);

    this.powerScoredTheGoal = undefined;
    this.lastPlayerToTouch = undefined;

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

    this.velocity = this.getRandomVelocity();
    this.acceleration = 1;
    this._move = true;
    if (this.effect !== undefined) this.effect?.setStopEffect();
  }

  private directGoal(backBar: Bar, frontBar?: Bar): boolean {
    if (this.powerScoredTheGoal !== undefined) {
      if (
        this.powerScoredTheGoal instanceof Bubble ||
        this.powerScoredTheGoal instanceof Fire
      ) {
        const shooter = this.powerScoredTheGoal.shooter;
        shooter.stats.incrementSpecialPowerStat(shooter.specialPowerType);
        shooter.stats.goalScored();
        return true;
      }
    }
    return false;
  }

  private notDirectGoal(
    backBar: Bar,
    opponent1: Bar,
    frontBar?: Bar,
    opponent2?: Bar
  ): void {
    if (this.lastPlayerToTouch !== undefined) {
      if (this.lastPlayerToTouch === backBar) {
        backBar.stats.goalScored();
        if (this.checkEffect(opponent1) || this.checkEffect(opponent2)) {
          backBar.stats.incrementSpecialPowerStat(backBar.specialPowerType);
        }
      } else if (this.lastPlayerToTouch === frontBar) {
        frontBar?.stats.goalScored();
        if (this.checkEffect(opponent1) || this.checkEffect(opponent2)) {
          frontBar?.stats.incrementSpecialPowerStat(frontBar.specialPowerType);
        }
      }
    }
  }

  private checkEffect(bar: Bar | undefined): boolean {
    if (bar === undefined) return false;
    if (bar.effect !== undefined) {
      if (
        bar.effect.name === 'SLOW' ||
        bar.effect.name === 'STOP' ||
        bar.effect.name === 'REVERSE' ||
        bar.effect.name === 'INVISIBLE'
      ) {
        return true;
      }
    }
    return false;
  }

  updatePlayerThatScoredStats(
    x: number,
    p1: Bar,
    p2: Bar,
    p3: Bar | undefined,
    p4: Bar | undefined
  ): void {
    if (x <= 0) {
      if (this.directGoal(p2, p4) === false) {
        this.notDirectGoal(p2, p1, p4, p3);
      }
    } else {
      if (this.directGoal(p1, p3) === false) {
        this.notDirectGoal(p1, p2, p3, p4);
      }
    }
  }

  resetBall(x: number): void {
    const p1 = this.game.getObjectByTag(
      PongModel.InGame.ObjType.Player1
    ) as Bar;
    const p2 = this.game.getObjectByTag(
      PongModel.InGame.ObjType.Player2
    ) as Bar;
    const p3 = this.game.getObjectByTag(
      PongModel.InGame.ObjType.Player3
    ) as Bar;
    const p4 = this.game.getObjectByTag(
      PongModel.InGame.ObjType.Player4
    ) as Bar;

    this.updatePlayerThatScoredStats(x, p1, p2, p3, p4);

    if (x <= 0) {
      if (p2) p2.reduceScale();
      if (p4) p4.reduceScale();
      this.game.gameStats.teamStats.goalScored(1);
      this.game.score[1] += 1;
    } else {
      if (p1) p1.reduceScale();
      if (p3) p3.reduceScale();
      this.game.gameStats.teamStats.goalScored(0);
      this.game.score[0] += 1;
    }
    this.game.scored = true;
    this.game.gameStats.goalScored();

    this.powerScoredTheGoal = undefined;
    this.lastPlayerToTouch = undefined;

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
    this.game.gameStats.increaseBounces(target);
    if (this.collider === undefined) return;
    this.collider.lastCollision = target.collider;

    if (target instanceof SpecialPower) {
      this.powerScoredTheGoal = target;
      this.lastPlayerToTouch = undefined;
    } else if (target instanceof Bar) {
      this.lastPlayerToTouch = target;
      this.powerScoredTheGoal = undefined;
    }
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
