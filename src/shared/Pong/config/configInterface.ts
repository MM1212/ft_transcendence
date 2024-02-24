//----------------------------
import _gameConfig from './game.json';
interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
}
const gameConfig: GameConfig = _gameConfig.game as GameConfig;
export { gameConfig };

type paddleObjectConfig = Record<
  | 'PaddleRed'
  | 'PaddleAcid'
  | 'PaddleBush'
  | 'PaddleGengar'
  | 'PaddleMinion'
  | 'PaddlePenguinBros'
  | 'PaddleRonaldo'
  | 'PaddleRainbow'
  | 'PaddleSnake'
  | 'PaddleWaveColors',
  {
    width: number;
    height: number;
    image: string;
    folder: string;
  }
>;
const paddleConfig: paddleObjectConfig =
  _gameConfig.paddles as paddleObjectConfig;
export { paddleConfig };

type specialPowerObjectConfig = Record<
  'spark' | 'fire' | 'ghost' | 'bubble' | 'ice' | 'none',
  {
    diameter: number;
    vertices: number;
    manaCost: number;
  }
>;
const specialpowerConfig: specialPowerObjectConfig =
  _gameConfig.powers as specialPowerObjectConfig;
export { specialpowerConfig };

type ballsObjectConfig = Record<
  'RedBall' | 'TennisBall' | 'FootBallBall' | 'VolleyBall' | 'PoolBall',
  {
    diameter: number;
    vertices: number;
    folder: string;
  }
>;
const ballsConfig: ballsObjectConfig = _gameConfig.balls as ballsObjectConfig;
export { ballsConfig };
