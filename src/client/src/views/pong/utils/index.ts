import PongModel from '@typings/models/pong';
import * as PIXI from 'pixi.js';
// add textures
const Targets = PongModel.Endpoints.Targets;
export const buildTexture = (target: PongModel.Endpoints.Targets | string) =>
  PIXI.Texture.from(target);

export const ScoreTex = buildTexture(`${Targets.Borders}/ScoreBorder.webp`);

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

export const ShooterAim = await buildAnimation(
  Targets.ShooterJSON,
  `${Targets.Shooter}/Shooter`,
  3
);
