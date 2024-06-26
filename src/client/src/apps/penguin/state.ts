import { Pixi } from '@hooks/pixiRenderer';
import { atomFamily } from 'recoil';
import animationConfig from './static/animations.json';
import {
  TPenguinAnimationSets,
  TPenguinAnimationDirection,
  IPenguinAnimationSetTypes,
  IPenguinBaseAnimationsTypes,
} from '@typings/penguin';
import publicPath from '@utils/public';

export { animationConfig };

export type IPenguinAnimationSet<
  K extends TPenguinAnimationSets = TPenguinAnimationSets,
  T extends TPenguinAnimationDirection = TPenguinAnimationDirection,
> = Record<IPenguinAnimationSetTypes<K, T>, Pixi.Texture[]>;

export type IPenguinBaseAnimations = {
  [K in IPenguinBaseAnimationsTypes]: Pixi.Texture[];
};

export interface AnimationConfigSet {
  id: number;
  frames?: number;
  speed?: number;
  loop?: boolean;
  next?: keyof IPenguinBaseAnimations;
}

const buildAnimationSet = (
  assetId: string,
  name: string,
  direction?: TPenguinAnimationDirection
): Pixi.Texture[] => {
  const key = !direction
    ? name
    : (`${name}/${direction}` as keyof typeof animationConfig);
  const { id, frames = 1 }: AnimationConfigSet = animationConfig[
    key as keyof typeof animationConfig
  ] as AnimationConfigSet;
  const textures = Array.from<Pixi.Texture>({ length: frames });
  for (let i = 0; i < frames; i++) {
    if (!Pixi.Assets.cache.has(`${assetId}/${id}_${i + 1}`))
      return Array.from({ length: i }, (_, i) =>
        Pixi.Texture.from(`${assetId}/${id}_${i + 1}`)
      );
    textures[i] = Pixi.Assets.get(`${assetId}/${id}_${i + 1}`);
  }
  return textures.map((texture) => {
    texture.baseTexture.scaleMode = Pixi.SCALE_MODES.LINEAR;
    return texture;
  });
};

const penguinState = new (class PenguinState {
  baseAnimations = atomFamily<IPenguinBaseAnimations, string>({
    key: 'penguin/base-animations',
    default: async (id) => {
      if (
        !isNaN(parseInt(id)) &&
        !Pixi.Assets.cache.has(publicPath(`/penguin/clothing/${id}/asset.json`))
      )
        await Pixi.Assets.load(
          publicPath(`/penguin/clothing/${id}/asset.json`)
        );
      return Object.keys(animationConfig).reduce((acc, key) => {
        const [animationSet, direction] = key.split('/');
        const setKey = !direction
          ? animationSet
          : `${animationSet}/${direction}`;
        const animation = buildAnimationSet(
          id,
          animationSet,
          direction as TPenguinAnimationDirection
        );
        acc[setKey as keyof IPenguinBaseAnimations] = animation;
        return acc;
      }, {} as IPenguinBaseAnimations);
    },
    dangerouslyAllowMutability: true,
  });
})();

export default penguinState;
