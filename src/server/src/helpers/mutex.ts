abstract class Lock {
  public readonly id: number = Math.random();
  constructor(public readonly mutex: Mutex) {}
}

class ScopeLock extends Lock {
  constructor(mut: Mutex) {
    super(mut);
    this.mutex.lock();
    Mutex.__cache.set(`${mut.__key}-${this.id}`, new WeakRef(this));
    Mutex.__gcCheck.register(this, `${mut.__key}-${this.id}`);
  }
}
class Mutex {
  private _locked: boolean = false;
  private readonly _queue: (() => void)[] = [];
  public static readonly __cache: Map<string, WeakRef<Lock>> = new Map();
  public static readonly __gcCheck: FinalizationRegistry<string> =
    new FinalizationRegistry((key) => {
      const lock = Mutex.__cache.get(key)?.deref();
      if (lock instanceof ScopeLock) {
        lock.mutex.unlock();
        Mutex.__cache.delete(key);
      }
    });
  constructor(public readonly __key: string) {}
  async lock(): Promise<void> {
    if (this._locked) {
      await new Promise<void>((resolve) => {
        this._queue.push(resolve);
      });
    }
    this._locked = true;
  }
  unlock(): void {
    if (!this._locked) return;
    this._locked = false;
    const next = this._queue.shift();
    if (next) next();
  }
  tryLock(): boolean {
    if (this._locked) return false;
    this._locked = true;
    return true;
  }
}

export { Mutex, ScopeLock };
