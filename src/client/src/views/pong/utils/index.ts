import PongModel from "@typings/models/pong";
import * as PIXI from "pixi.js";
// add textures
const Targets = PongModel.Endpoints.Targets;
const buildTexture = (target: PongModel.Endpoints.Targets) =>
  PIXI.Texture.from(target);

export const P1Tex = buildTexture(Targets.PaddleTexture1);
export const P2Tex = buildTexture(Targets.PaddleTexture1);
export const BallTex = buildTexture(Targets.BallTexture1);
export const BubbleTex = buildTexture(Targets.PowerWaterTexture);
export const IceTex = buildTexture(Targets.PowerIceTexture);
export const SparkTex = buildTexture(Targets.PowerSparkTexture);
export const CannonTex = buildTexture(Targets.PowerCannonTexture);
export const MarioBoxTex = buildTexture(Targets.MarioBoxTexture);
export const GhostTex = buildTexture(Targets.PowerGhostTexture);
export const ARENA_SIZE = 50;
export const DEFAULT_LINE_COLOR = 0xffffff;
export const DEFAULT_FIELD_COLOR = 0x000000;
export const P_START_DIST = 40;
export const hue_value = 0;