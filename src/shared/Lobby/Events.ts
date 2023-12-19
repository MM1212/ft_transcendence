export interface IEventPackage<
  T extends string = string,
  Args extends unknown[] = unknown[]
> {
  event: T;
  args: Args;
}
export interface IEventEmitter {
  on<T extends IEventPackage>(
    event: T['event'],
    listener: (...args: T['args']) => any
  ): void;
  off<T extends IEventPackage>(
    event: T['event'],
    listener: (...args: T['args']) => any
  ): void;
  emit<T extends IEventPackage>(event: T['event'], ...args: T['args']): void;
}

export abstract class Events {
  protected abstract readonly emitter: IEventEmitter;

  constructor() {}

  public on<T extends IEventPackage>(
    event: T['event'],
    listener: (...args: T['args']) => any
  ): void {
    this.emitter.on(event, listener);
  }
  public emit<T extends IEventPackage>(
    event: T['event'],
    ...args: T['args']
  ): void {
    this.emitter.emit(event, ...args);
  }
  public off<T extends IEventPackage>(
    event: T['event'],
    listener: (...args: T['args']) => any
  ): void {
    this.emitter.off(event, listener);
  }
}
