import PongModel from '@typings/models/pong';
import * as PIXI from 'pixi.js';
// add textures
const Targets = PongModel.Endpoints.Targets;
export const buildTexture = (target: PongModel.Endpoints.Targets | string) =>
  PIXI.Texture.from(target);

export const ScoreTex = buildTexture(`${Targets.Borders}/ScoreBorder.webp`);

export const BubbleTex = buildTexture(Targets.PowerWaterTexture);
export const IceTex = buildTexture(Targets.PowerIceTexture);
export const SparkTex = buildTexture(Targets.PowerSparkTexture);
export const AnimFireTex = buildTexture(Targets.PowerFireTexture);
export const GhostTex = buildTexture(Targets.PowerGhostTexture);
export const DisconnectWindowTex = buildTexture(Targets.DisconnectWindow);
export const BorderTex = buildTexture(`${Targets.Borders}/TopDownBorder.webp`);
export const BackgroundTex = buildTexture(`${Targets.Background}.webp`);

export const buildAnimation = async (json: string, path: string, n: number) => {
  const frames = [];

  await PIXI.Assets.load(json);

  for (let i = 0; i < n; i++) {
    frames.push(PIXI.Texture.from(`${path}${i}.webp`));
    console.log(`${path}${i}.webp`);
  }

  return frames;
};

export async function AnimationConstructor(
  walk: { path: string; json: string; frames: number },
  dies: { path: string; json: string; frames: number } | undefined
): Promise<[PIXI.AnimatedSprite, PIXI.AnimatedSprite | undefined]> {
  const displayObject = new PIXI.AnimatedSprite(
    await buildAnimation(walk.json, walk.path, walk.frames)
  );
  let tempOnCollideAnimation = undefined;
  if (dies) {
    tempOnCollideAnimation = new PIXI.AnimatedSprite(
      await buildAnimation(dies.json, dies.path, dies.frames)
    );
  }
  return [displayObject, tempOnCollideAnimation];
}

export const TimeBorderTex = buildTexture(`${Targets.Borders}/TimeBorder.webp`);

// export const GhostDies = await buildAnimation(
//   Targets.GhostDiesJSON,
//   `${Targets.GhostDies}/GhostDies`,
//   5
// );

// export const GhostWalk = await buildAnimation(
//   Targets.GhostWalkJSON,
//   `${Targets.GhostWalk}/GhostWalk`,
//   6
// );

// export const BubbleWalk = await buildAnimation(
//   Targets.BubbleWalkJSON,
//   `${Targets.BubbleWalk}/BubbleWalk`,
//   1
// );

// export const BubbleDies = await buildAnimation(
//   Targets.BubbleDiesJSON,
//   `${Targets.BubbleDies}/BubbleDies`,
//   4
// );

export const ShooterAim = await buildAnimation(
  Targets.ShooterJSON,
  `${Targets.Shooter}/Shooter`,
  3
);

// export const FireballWalk = await buildAnimation(
//   Targets.FireballWalkJSON,
//   `${Targets.FireballWalk}/FireballWalk`,
//   5
// );

// export const FireballDies = await buildAnimation(
//   Targets.FireballDiesJSON,
//   `${Targets.FireballDies}/FireballDies`,
//   3
// );

// export const IceWalk = await buildAnimation(
//   Targets.IceWalkJSON,
//   `${Targets.IceWalk}/IceWalk`,
//   4
// );

// export const IceDies = await buildAnimation(
//   Targets.IceDiesJSON,
//   `${Targets.IceDies}/IceDies`,
//   10
// );

// export const SparkWalk = await buildAnimation(
//   Targets.SparkWalkJSON,
//   `${Targets.SparkWalk}/SparkWalk`,
//   1
// );

// export const SparkDies = await buildAnimation(
//   Targets.SparkDiesJSON,
//   `${Targets.SparkDies}/SparkDies`,
//   5
// );
