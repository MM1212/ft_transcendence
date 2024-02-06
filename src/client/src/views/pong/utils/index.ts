import PongModel from '@typings/models/pong';
import * as PIXI from 'pixi.js';
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

const buildAnimation = async (json: string, path: string, n: number) => {
  const frames = [];

  await PIXI.Assets.load(json);

  for (let i = 0; i < n; i++) {
    frames.push(PIXI.Texture.from(`${path}${i}.png`));
  }

  return frames;
};

export const GhostDies = await buildAnimation(
  Targets.GhostDiesJSON,
  `${Targets.GhostDies}/GhostDies`,
  5
);

export const GhostWalk = await buildAnimation(
  Targets.GhostWalkJSON,
  `${Targets.GhostWalk}/GhostWalk`,
  6
);
