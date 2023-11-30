import WildcardEngine from '../WildcardEngine';
import { Path, PathSet, PathSetter, PathValue } from './types';

class CacheNotifyContext<
  T extends object,
  K extends Path<T>,
  V extends PathValue<T, K>
> {
  constructor(
    public readonly store: CacheObserver<T>,
    public readonly path: K,
    public readonly key: string,
    public readonly value: V
  ) {}
}

interface Subscriber<T extends object> {
  handler: (ctx: CacheNotifyContext<T, any, any>) => void | false;
  pattern: string;
  prio: number;
  handle: number;
}
export class CacheObserver<T extends object> {
  private subscribersCookie: number = 0;
  constructor(
    private store: T,
    private readonly subscribers: Subscriber<T>[] = []
  ) {}
  public get(): T;
  public get<K extends Path<T>>(key: K): PathValue<T, K>;
  public get<K extends Path<T>[]>(
    ...keys: K
  ): { [I in keyof K]: PathValue<T, K[I]> };
  public get(...args: unknown[]): unknown {
    if (args.length === 0) return this.store;
    if (args.length > 1)
      return args.map((key) => this.get(key as any)) as unknown;
    return (args[0] as string)
      .split('.')
      .reduce((acc: any, key) => acc?.[key], this.store);
  }
  private setValue<K extends Path<T>>(key: K, value: PathValue<T, K>): void {
    const path = key.split('.');
    if (!path.length) throw new Error('Invalid Path ' + key);
    const lastKey = path.pop();
    const target = path.reduce((acc: any, key) => acc?.[key], this.store);
    if (!target) throw new Error('Invalid Path ' + key);
    if (!this.notify(key, value)) return;
    target[lastKey as string] = value;
  }
  public set<K extends Path<T>>(
    key: K,
    value: PathSet<PathValue<T, K>>
  ): CacheObserver<T> {
    let ret: PathValue<T, K>;
    if (typeof value === 'function')
      ret = (value as PathSetter<PathValue<T, K>>)(this.get(key));
    else ret = value;
    this.setValue(key, ret as PathValue<T, K>);
    return this;
  }
  private getSubscribers(key: string): Subscriber<T>[] {
    return this.subscribers.filter((sub) =>
      WildcardEngine.match(sub.pattern, key)
    );
  }
  private notify<K extends Path<T>>(key: K, value: PathValue<T, K>): boolean {
    const ctx = new CacheNotifyContext(
      this,
      key,
      (key as string).split('.').pop()!,
      value
    );
    const subs = this.getSubscribers(key);
    if (!subs.length) return true;
    return subs.every((subscriber) => subscriber.handler(ctx) !== false);
  }
  public subscribe<K extends Path<T> & string>(
    pattern: K,
    handler: Subscriber<T>['handler'],
    prio = -1
  ): number {
    const sub: Subscriber<T> = {
      handler,
      pattern,
      prio,
      handle: this.subscribersCookie++,
    };
    this.subscribers.push(sub);
    this.subscribers.sort((a, b) => b.prio - a.prio);
    return sub.handle;
  }
  public unsubscribe(handle: number): void {
    const idx = this.subscribers.findIndex((sub) => sub.handle === handle);
    if (idx < 0) return;
    this.subscribers.splice(idx, 1);
  }
  public clear(): void {
    this.subscribers.length = 0;
  }
  public setTo(data: T | ((prev: T) => T)): void {
    this.store = data instanceof Function ? data(this.store) : data;
  }
}
