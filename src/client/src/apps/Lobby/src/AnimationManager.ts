import * as PIXI from 'pixi.js';
import config from '../static/animations.json';
import LobbyModel from '@typings/models/lobby';
import assetRefCount from '@utils/pixi/AssetRefCount';
import publicPath from '@utils/public';
import { IPenguinBaseAnimations } from './pixi';

class AnimationManager {
  private config: typeof config = config;

  private buildAnimationSet(
    assetId: string,
    name: string,
    direction?: LobbyModel.Models.TPenguinAnimationDirection
  ): PIXI.Texture[] {
    const key = !direction
      ? name
      : (`${name}/${direction}` as keyof typeof this.config);
    const { id, frames = 1 }: LobbyModel.Models.AnimationConfigSet = this.config[
      key as keyof typeof this.config
    ] as LobbyModel.Models.AnimationConfigSet;
    const textures = Array.from<PIXI.Texture>({ length: frames });
    for (let i = 0; i < frames; i++) {
      if (!PIXI.Assets.cache.has(`${assetId}/${id}_${i + 1}`))
        return Array.from({ length: i }, (_, i) =>
          PIXI.Texture.from(`${assetId}/${id}_${i + 1}`)
        );
      textures[i] = PIXI.Assets.get(`${assetId}/${id}_${i + 1}`);
    }
    return textures.map((texture) => {
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
      return texture;
    });
  }

  private cache = new Map<string, IPenguinBaseAnimations>();
  async compute(asset: string): Promise<IPenguinBaseAnimations> {
    if (this.cache.has(asset)) return this.cache.get(asset) as IPenguinBaseAnimations;
    if (!isNaN(parseInt(asset)))
      await assetRefCount.load(
        publicPath(`/penguin/clothing/${asset}/asset.json`)
      );
    const data = Object.keys(this.config).reduce((acc, key) => {
      const [animationSet, direction] = key.split('/');
      const setKey = !direction ? animationSet : `${animationSet}/${direction}`;
      const animation = this.buildAnimationSet(
        asset,
        animationSet,
        direction as LobbyModel.Models.TPenguinAnimationDirection
      );
      acc[setKey as keyof IPenguinBaseAnimations] = animation;
      return acc;
    }, {} as IPenguinBaseAnimations);
    this.cache.set(asset, data);
    return data;
  }

  getAnimSettings(anim: LobbyModel.Models.IPenguinBaseAnimationsTypes): LobbyModel.Models.AnimationConfigSet {
    return this.config[anim as keyof typeof this.config] as LobbyModel.Models.AnimationConfigSet;
  }
}

const animationManager = new AnimationManager();

export default animationManager;
