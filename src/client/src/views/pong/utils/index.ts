import PongModel from "@typings/models/pong";
import * as PIXI from "pixi.js";
// add textures
const Targets = PongModel.Endpoints.Targets;
export const buildTexture = (target: PongModel.Endpoints.Targets | string) =>
  PIXI.Texture.from(target);

export const BubbleTex = buildTexture(Targets.PowerWaterTexture);
export const IceTex = buildTexture(Targets.PowerIceTexture);
export const SparkTex = buildTexture(Targets.PowerSparkTexture);
export const AnimFireTex = buildTexture(Targets.PowerFireTexture);
export const GhostTex = buildTexture(Targets.PowerGhostTexture);
export const DisconnectWindowTex = buildTexture(Targets.DisconnectWindow);