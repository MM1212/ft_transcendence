import { Events, IEventEmitter, IEventPackage } from '@shared/Lobby/Events';

class EventEmitter extends EventTarget implements IEventEmitter {
  constructor() {
    super();
  }
  private funRefs: Map<(...args: any[]) => any, (...args: any[]) => any> =
    new Map();
  on<T extends IEventPackage<string, unknown[]>>(
    event: T['event'],
    listener: (...args: T['args']) => any
  ): void {
    const cb = (ev: Event) => {
      listener(...(ev as CustomEvent).detail);
    };
    this.funRefs.set(listener, cb);
    this.addEventListener(event, cb);
  }
  off<T extends IEventPackage<string, unknown[]>>(
    event: T['event'],
    listener: (...args: T['args']) => any
  ): void {
    const ref = this.funRefs.get(listener);
    if (!ref) return;
    this.removeEventListener(event, ref);
  }
  emit(event: string, ...args: any[]): void {
    this.dispatchEvent(new CustomEvent(event, { detail: args }));
  }
}

export class ClientEvents extends Events {
  protected readonly emitter: EventEmitter = new EventEmitter();
  constructor() {
    super();
  }
}
