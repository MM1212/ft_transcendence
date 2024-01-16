//----------------------------
import _gameConfig from "./game.json";
interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
}
const gameConfig: GameConfig = _gameConfig.game as GameConfig;
export { gameConfig };

export type BallsConfig = Record<"RedBall" | "default",
{
  diameter: number;
  vertices: number;
  image: string;
}
>;
const ballsConfig: BallsConfig = _gameConfig.balls as BallsConfig;
export { ballsConfig };

type paddleObjectConfig = Record<
  "PaddleRed" | "default",
  {
    width: number;
    height: number;
    image: string;
  }
>;
const paddleConfig: paddleObjectConfig = _gameConfig.paddles as paddleObjectConfig;
export { paddleConfig };

type specialPowerObjectConfig = Record<
  "spark" | "fire" | "ghost" | "bubble" | "ice" | "none",
  {
    diameter: number;
    vertices: number;
    manaCost: number;
  }
>;
const specialpowerConfig: specialPowerObjectConfig =
  _gameConfig.powers as specialPowerObjectConfig;
export { specialpowerConfig };
