import * as PIXI from 'pixi.js';

class AssetRefCount {
  public readonly store: Map<string, number> = new Map();

  public async load(asset: string): Promise<PIXI.Texture | null>;
  public async load(asset: string[]): Promise<(PIXI.Texture | null)[]>;
  public async load(
    asset: string | string[]
  ): Promise<PIXI.Texture | null | (PIXI.Texture | null)[]> {
    const isOne = !Array.isArray(asset);
    if (!Array.isArray(asset)) asset = [asset];
    const assets = await Promise.all(asset.map((a) => this.loadOne(a)));
    return isOne ? assets[0] : assets;
  }
  public async loadOne(asset: string): Promise<PIXI.Texture | null> {
    const refCount = this.store.get(asset) || 0;
    this.store.set(asset, refCount + 1);

    return await PIXI.Assets.load(asset);
  }

  public async unload(asset: string): Promise<void> {
    const refCount = this.store.get(asset) || 0;
    if (refCount > 0) {
      this.store.set(asset, refCount - 1);
    }

    if (refCount === 1) {
      await PIXI.Assets.unload(asset);
    }
  }
}

const assetRefCount = new AssetRefCount();

export default assetRefCount;
