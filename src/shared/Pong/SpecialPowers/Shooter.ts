import { Bar } from "../Paddles/Bar";
import { Vector2D } from "../utils/Vector";
import { Game } from "../Game";
import { Ball } from "../Ball";

export class Shooter {
    protected line: {start: Vector2D, end: Vector2D}
    protected angle: number;
    protected center: Vector2D;
    protected direction: Vector2D = new Vector2D(1, 0);
    protected ballRef: Ball | undefined;

    protected upDown: number = 1;
    
    constructor(shooter: Bar, protected readonly game: Game)
    {
        this.line = {start: Vector2D.Zero, end: Vector2D.Zero};
        this.angle = -(Math.PI / 4);
        this.ballRef = this.game.getObjectByTag("Bolinha") as Ball;
        if (!this.ballRef)
            throw new Error("Ball not found");
        
        shooter.setCenter(new Vector2D(shooter.getCenter.x, game.height / 2));
        this.ballRef.setCenter(new Vector2D(shooter.getCenter.x + (40 * shooter.direction.x), shooter.getCenter.y));
        
        this.ballRef.setMove(false);
        this.center = this.ballRef.getCenter;
        this.direction = shooter.direction;
        shooter.setVelocity(new Vector2D(0, 0));
    }
    
    shootBall(shooter: Bar): void
    {
        shooter.setShooter(undefined);
        shooter.setMove(true);
    
        this.ballRef?.setVelocity(new Vector2D(Math.cos(this.angle), Math.sin(this.angle)).multiply(this.ballRef.getVelocity.length() * 2));
        this.ballRef?.setMove(true);
        this.ballRef?.getEffect?.setStopEffect();
        this.ballRef?.setEffect(undefined);
        this.ballRef = undefined;
    }
    
    update(delta: number, shooter: Bar): boolean {
        if (shooter.shooting === false) return false;
        else {
            const lineLength = 60;
            const angleIncrement = 0.015;
            
            this.angle += angleIncrement * this.direction.x * delta * this.upDown;

            if (this.direction.x === 1)
            {
                if (this.angle >= Math.PI / 4)
                {
                    this.angle = Math.PI / 4;
                    this.upDown = -1;
                }
                else if (this.angle <= -Math.PI / 4)
                {
                    this.angle = -Math.PI / 4;
                    this.upDown = 1;
                }
            }
            else if (this.direction.x === -1)
            {
                if (this.angle >= Math.PI * 5 / 4)
                {
                    this.angle = Math.PI * 5 / 4;
                    this.upDown = 1;
                }
                else if (this.angle <= Math.PI * 3 / 4)
                {
                    this.angle = Math.PI * 3 / 4;
                    this.upDown = -1;
                }
            }

            this.line = {
                    start: this.center,
                    end: new Vector2D(
                        this.center.x + (Math.cos(this.angle) * lineLength),
                        this.center.y + Math.sin(this.angle) * lineLength )};

            if (this.ballRef?.getEffect?.isEffectOver === true)// || this.ballRef?.getEffect === undefined)
            {
                console.log("effect over now shoot");
                this.shootBall(shooter);
                return false;
            }
            return true;
        }
    }
}
