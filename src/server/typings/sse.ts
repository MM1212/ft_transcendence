import { EventEmitter2 } from '@nestjs/event-emitter';
import { SSE } from '@typings/api/sse';
export { SSE };

export interface ISseService {
  get local(): EventEmitter2;
  emitWithTarget<T extends SSE.Event, E extends SSE.Events = SSE.Events>(
    event: E,
    client: SSE.User,
    data: T['data'],
  ): void;
  emitToTargets<T extends SSE.Event, E extends SSE.Events = SSE.Events>(
    event: E,
    targets: SSE.User[],
    data: T['data'],
  ): void;
  emitToTargets<T extends SSE.Event, E extends SSE.Events = SSE.Events>(
    event: E,
    source: SSE.User,
    targets: SSE.User[],
    data: T['data'],
  ): void;
  emitToAll<T extends SSE.Event, E extends SSE.Events = SSE.Events>(event: E, data: T['data']): void;
}
