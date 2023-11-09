import { GameObject } from "../GameObject";
import { Vector2D } from "../utils/Vector";
import { SpecialPower } from "./SpecialPower";
import { specialpowerConfig } from "../config/configInterface";
import { Bar } from "../Paddles/Bar";
import { BarPolygon } from "../Collisions/Polygon";
import { Ball } from "../Ball";

export class Bubble extends SpecialPower {
    constructor(center: Vector2D, velocity: Vector2D, shooter: Bar) {
        super("Bubble", center, velocity, shooter, specialpowerConfig.bubble.diameter, specialpowerConfig.bubble.vertices);
    }

    onCollide(target: GameObject): boolean {
        if (!(target instanceof SpecialPower)){

            if (target instanceof Ball) 
            {
                //let newVelX = target.getVelocity.x * -1;
                //let newVelY = target.getVelocity.y;
                //if (centerDiff.y > 0) {
                //    newVelY = Math.abs(newVelY);
                //} else {
                //    newVelY = Math.abs(newVelY) * -1;
                //}

                // where the ball hit
                let collidePoint = this.getCenter.y - target.getCenter.y;
                // normalize the value
                collidePoint = collidePoint / (target.getHeight / 2);
                
                // calculate the angle in Radian
                const angleRad = collidePoint * (Math.PI / 6);
                
                // Determine the direction based on the current X velocity
                const direction = this.getVelocity.x > 0 ? -1 : 1;
                // Store the current speed (magnitude of velocity)
                const currentSpeed = Math.sqrt(this.getVelocity.x ** 2 + this.getVelocity.y ** 2);

                // Change the X and Y velocity direction
                this.getVelocity.x = currentSpeed * Math.cos(angleRad) * direction;
                this.getVelocity.y = currentSpeed * -Math.sin(angleRad);
                
                let newVelX = target.getVelocity.x * -1;
                let newVelY = target.getVelocity.y;
                let centerDiff = (this.getCenter.y - target.getCenter.y) / target.getHeight;
                if (centerDiff > 0) {
                    newVelY = Math.abs(newVelY);
                } else {
                    newVelY = Math.abs(newVelY) * -1;
                }
                target.setVelocity(new Vector2D(newVelX, newVelY));
                
            }

            this.game.remove(this);
            return true;
        }
        return false;
    }
}
