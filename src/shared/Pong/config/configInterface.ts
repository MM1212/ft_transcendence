import { KeyControls } from "../Paddles/Player";
import { SpecialPowerType } from "../SpecialPowers/SpecialPower";
import { Vector2D } from "../utils/Vector";

export interface IPlayerConfig {
  tag: string;
  teamId: number;
  type: "player" | "bot";
  keys?: KeyControls;
  specialPower: SpecialPowerType;
  paddleTexture: string;
  paddleColor: number;
  positionOrder: "back" | "front";
  userId: string;
  ready: boolean;
  connected: boolean;
}

export interface IGameConfig {
  roomId: string;
  teams: [ITeam, ITeam];
  partyOwnerId: string; // userId
  spectators: number[]; // userIds
  backgroundColor: number;
  lineColor: number;
  nPlayers: number;
}

export enum ETeamSide {
  Left,
  Right,
}

export interface ITeam {
  id: ETeamSide;
  players: IPlayerConfig[];
  score: number;
}
//----------------------------
import _gameConfig from "./game.json";
export interface GameConfig {
  canvas: {
    width: number;
    height: number;
    fieldHexColor: string;
  };

  p1: {
    name: string;
    hexColor: string;
    specialPower: string;
    paddleSkin: string;
  };

  p2: {
    name: string;
    hexColor: string;
    specialPower: string;
    paddleSkin: string;
  };

  p3: {
    name: string;
    hexColor: string;
    specialPower: string;
    paddleSkin: string;
  };

  p4: {
    name: string;
    hexColor: string;
    specialPower: string;
    paddleSkin: string;
  };

  ball: {
    name: string;
    hexColor: string;
    color: string;
    skin: string;
    diameter: number;
    vertices: number;
  };
}
const gameConfig: GameConfig = _gameConfig as GameConfig;
export { gameConfig };

/* ----------------------- Game Config ----------------------- */

/* ----------------------- Bar Config ----------------------- */
import _paddleConfig from "./paddles.json";
export interface paddleObjectConfig {
  paddle: {
    width: number;
    height: number;
    colliderType: "Bar";
    colliderData: {
      radius?: number;
      vertices?: Vector2D[];
    };
  };
}
const paddleConfig: paddleObjectConfig = _paddleConfig as paddleObjectConfig;
export { paddleConfig };
/* ----------------------- Bar Config ----------------------- */

/* ------------------ Special Powers Config ------------------*/
import _specialpowerConfig from "./specialpower.json";
export interface specialPowerObjectConfig {
  spark: {
    texture: string;
    diameter: number;
    vertices: number;
  };

  fire: {
    texture: string;
    diameter: number;
    vertices: number;
  };

  ghost: {
    texture: string;
    diameter: number;
    vertices: number;
  };

  bubble: {
    texture: string;
    diameter: number;
    vertices: number;
  };

  ice: {
    texture: string;
    diameter: number;
    vertices: number;
  };

  marioBox: {
    texture: string;
    diameter: number;
    vertices: number;
  };
}
const specialpowerConfig: specialPowerObjectConfig =
  _specialpowerConfig as specialPowerObjectConfig;
export { specialpowerConfig };
