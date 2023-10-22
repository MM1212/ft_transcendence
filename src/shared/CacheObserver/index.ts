import { Path, PathSet, PathValue } from './types';

export class CacheSetter<T> {
  constructor(public readonly store: T) {}
}

export class CacheObserver<T> {
  private readonly subscribers: Map<string, (value: T) => void> = new Map();
  constructor(private store: T) {}
  public get(): T;
  public get<K extends Path<T>>(key: K): PathValue<T, K>;
  // return a tuple with multiple values by keys in order
  public get<K extends Path<T>[]>(
    ...keys: K
  ): { [I in keyof K]: PathValue<T, K[I]> };
  public get(...args: unknown[]): unknown {
    if (args.length === 0) return this.store;
    if (args.length > 1)
      return args.map((key) => this.get(key as any)) as unknown;
    return (args[0] as string)
      .split('.')
      .reduce((acc, key) => acc?.[key], this.store);
  }
  private setValue<K extends Path<T>>(key: K, value: PathValue<T, K>): void {
    const path = key.split('.');
    const lastKey = path.pop();
    const target = path.reduce((acc, key) => acc?.[key], this.store);
    if (!target) throw new Error('Invalid path');
    target[lastKey as string] = value;
  }
  public set<K extends Path<T>>(key: K, value: PathSet<PathValue<T, K>>): void;
  public set(values: PathSet<T>): void;
  public set(key: unknown, value?: unknown): void {
    if (typeof key !== 'string') throw new Error('Invalid argument');
    return this.setValue(key as any, value as any);
  }
}
