class AssetCache {
  private readonly store: Map<string, unknown> = new Map();

  public async load<T = unknown>(
    asset: string,
    loader?: (resp: Response) => Promise<T>
  ): Promise<T | null>;
  public async load<T = unknown>(
    asset: string[],
    loader?: (resp: Response) => Promise<T>
  ): Promise<(T | null)[]>;
  public async load<T = unknown>(
    asset: string | string[],
    loader: (resp: Response) => Promise<T> = (resp) => resp.json() as Promise<T>
  ): Promise<T | null | (T | null)[]> {
    const isOne = !Array.isArray(asset);
    if (!Array.isArray(asset)) asset = [asset];
    const assets = await Promise.all(
      asset.map((a) => this.loadOne<T>(a, loader))
    );
    return isOne ? assets[0] : assets;
  }
  private async loadOne<T = unknown>(
    asset: string,
    loader: (resp: Response) => Promise<T>
  ): Promise<T | null> {
    try {
      if (this.store.has(asset)) return this.store.get(asset) as T;
      const data = await fetch(asset).then(loader);
      this.store.set(asset, data);
      return data as T;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

const assetCache = new AssetCache();

export default assetCache;
