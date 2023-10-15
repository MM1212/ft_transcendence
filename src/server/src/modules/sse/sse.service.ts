import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ISseService, SSE } from '@typings/sse';

@Injectable()
class SseService implements ISseService {
  constructor(private readonly emitter: EventEmitter2) {}
  get local(): EventEmitter2 {
    return this.emitter;
  }
  emitWithTarget<T extends SSE.Models.Event, E extends SSE.Models.Events = SSE.Models.Events>(
    event: E,
    source: number,
    data: T['data'],
  ): void {
    const eventName = `net.${event}`;

    this.emitter.emit(eventName, {
      event: eventName,
      source,
      data,
    });
  }
  emitToTargets<T extends SSE.Models.Event, E extends SSE.Models.Events = SSE.Models.Events>(
    event: E,
    targets: number[],
    data: T['data'],
  ): void;
  emitToTargets<T extends SSE.Models.Event, E extends SSE.Models.Events = SSE.Models.Events>(
    event: E,
    source: number,
    targets: number[],
    data: T['data'],
  ): void;
  emitToTargets(
    event: unknown,
    source: unknown,
    targets: unknown,
    data?: unknown,
  ): void {
    const eventName = `net.${event}`;
    switch (typeof source) {
      case 'number':
        this.emitter.emit(eventName, {
          event: eventName,
          source,
          targets,
          data,
        });
        break;
      case 'object':
        this.emitter.emit(eventName, {
          event: eventName,
          targets: source,
          data: targets,
        });
        break;
    }
  }
  emitToAll<T extends SSE.Models.Event, E extends SSE.Models.Events = SSE.Models.Events>(
    event: E,
    data: T['data'],
  ): void {
    const eventName = `net.${event}`;
    this.emitter.emit(eventName, {
      event: eventName,
      data,
    });
  }
}

export { SseService };
