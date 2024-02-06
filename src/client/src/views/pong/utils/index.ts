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
    console.log(`${path}${i}.png`);
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

export const BubbleWalk = await buildAnimation(
  Targets.BubbleWalkJSON,
  `${Targets.BubbleWalk}/BubbleWalk`,
  1
);

export const BubbleDies = await buildAnimation(
  Targets.BubbleDiesJSON,
  `${Targets.BubbleDies}/BubbleDies`,
  4
);

export const ShooterAim = await buildAnimation(
  Targets.ShooterJSON,
  `${Targets.Shooter}/Shooter`,
  3
);

export const FireballWalk = await buildAnimation(
  Targets.FireballWalkJSON,
  `${Targets.FireballWalk}/FireballWalk`,
  5
);

export const FireballDies = await buildAnimation(
  Targets.FireballDiesJSON,
  `${Targets.FireballDies}/FireballDies`,
  3
);

export const IceWalk = await buildAnimation(
  Targets.IceWalkJSON,
  `${Targets.IceWalk}/Ice`,
  4
);

export const IceDies = await buildAnimation(
  Targets.IceDiesJSON,
  `${Targets.IceDies}/IceDies`,
  10
);
