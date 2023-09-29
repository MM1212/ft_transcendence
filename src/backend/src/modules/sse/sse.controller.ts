import { Controller, Post, Sse } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable, bindCallback, filter, map } from 'rxjs';
import HttpCtx from '@/helpers/decorators/httpCtx';
import { HTTPContext } from '@typings/http';
import { SSE } from '@typings/sse';
import { OnConnectionClosed } from '@/helpers/decorators/socket';

interface InternalNetPayload {
  event: string;
  source?: number;
  targets?: number[];
  data: unknown;
}

@Controller('sse')
export class SseController {
  constructor(private readonly service: SseService) {}
  @Sse()
  connect(
    @HttpCtx() ctx: HTTPContext,
    @OnConnectionClosed() onClosed: Observable<void>,
  ): Observable<MessageEvent> | undefined {
    if (!ctx.user?.loggedIn) {
      ctx.res.status(401);
      return;
    }
    const user = ctx.user;
    console.log('New SSE connection from user', user.id);

    // this.service.local.on('net.*', cb)
    onClosed.subscribe({
      complete: () => {
        console.log('SSE disconnection from user', user.id, 'closed');
      },
    });
    return bindCallback<
      [],
      [
        {
          event: string;
          source?: number;
          targets?: number[];
          data: unknown;
        },
      ]
    >((cb) => {
      this.service.local.on('net.**', cb);
      return () => {
        this.service.local.off('net.**', cb);
      };
    })().pipe(
      filter((data) => {
        if (!data.targets) return true;
        if (data.targets && data.targets.includes(user.id)) return true;
        return false;
      }),
      map<InternalNetPayload, SSE.Event>((data) => {
        const { event: eventName, source, data: payload } = data;
        const event: SSE.Event = {
          type: eventName as SSE.Events,
          source,
          data: payload,
        };
        console.log('SSE event', event);
        return event;
      }),
      map<SSE.Event, MessageEvent>(
        (event) =>
          new MessageEvent('message', {
            data: typeof event === 'object' ? JSON.stringify(event) : event,
          }),
      ),
    ) as Observable<MessageEvent> | undefined;
  }
  @Post('test')
  test(): void {
    this.service.emitToAll<SSE.Payloads.FacebookNewFriendRequest>(
      SSE.Events.FacebookNewFriendRequest,
      {
        user: 123,
      },
    );
  }
}
