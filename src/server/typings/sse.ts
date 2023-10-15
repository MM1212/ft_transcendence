import { EventEmitter2 } from '@nestjs/event-emitter';
import { SseModel as SSE } from '@typings/api/models';
export { SSE };

export interface ISseService {
  get local(): EventEmitter2;
  emitWithTarget<
    T extends SSE.Models.Event,
    E extends SSE.Models.Events = SSE.Models.Events,
  >(
    event: E,
    client: SSE.Models.User,
    data: T['data'],
  ): void;
  emitToTargets<
    T extends SSE.Models.Event,
    E extends SSE.Models.Events = SSE.Models.Events,
  >(
    event: E,
    targets: SSE.Models.User[],
    data: T['data'],
  ): void;
  emitToTargets<
    T extends SSE.Models.Event,
    E extends SSE.Models.Events = SSE.Models.Events,
  >(
    event: E,
    source: SSE.Models.User,
    targets: SSE.Models.User[],
    data: T['data'],
  ): void;
  emitToAll<
    T extends SSE.Models.Event,
    E extends SSE.Models.Events = SSE.Models.Events,
  >(
    event: E,
    data: T['data'],
  ): void;
}
