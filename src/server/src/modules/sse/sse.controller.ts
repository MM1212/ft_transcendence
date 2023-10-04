import {
  Body,
  Controller,
  OnModuleDestroy,
  OnModuleInit,
  Post,
  Sse,
} from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable, ReplaySubject, map } from 'rxjs';
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

interface Client {
  id: number;
  handle: string; // dbId + sessionId
  subject: ReplaySubject<InternalNetPayload>;
  observer: Observable<InternalNetPayload>;
}

@Controller('sse')
export class SseController implements OnModuleInit, OnModuleDestroy {
  private readonly clients: Client[] = [];
  private netHandler: (data: InternalNetPayload) => void;
  constructor(private readonly service: SseService) {}
  onModuleInit() {
    this.service.local.on(
      'net.**',
      (this.netHandler = this.onNetEvent.bind(this)),
    );
  }
  onModuleDestroy() {
    this.service.local.off('net.**', this.netHandler);
  }
  private onNetEvent(data: InternalNetPayload) {
    this.clients.forEach((client) => {
      if (data.source && data.source === client.id) return;
      if (data.targets && !data.targets.includes(client.id)) return;
      client.subject.next(data);
    });
  }
  @Sse()
  connect(
    @HttpCtx() ctx: HTTPContext,
    @OnConnectionClosed() onClosed: Observable<void>,
  ): Observable<MessageEvent> {
    if (!ctx.user?.loggedIn) {
      ctx.res.status(401).send();
      return new Observable();
    }
    const user = ctx.user;
    console.log('New SSE connection from user', user.id);

    const subject = new ReplaySubject<InternalNetPayload>();
    const observer = subject.asObservable();
    const client: Client = {
      id: user.id,
      handle: `${user.id}:${ctx.session.id}`,
      subject,
      observer,
    };
    this.clients.push(client);
    onClosed.subscribe({
      complete: () => {
        console.log('SSE connection closed for user', user.id);
        subject.complete();
        this.clients.splice(this.clients.indexOf(client), 1);
      },
    });
    return observer.pipe(
      map((data) => {
        const event = new MessageEvent('message', {
          lastEventId: `sse/${client.handle}/${data.event}/${Date.now()}`,
          data: JSON.stringify({
            data: data.data,
            source: data.source,
            type: data.event,
          } as SSE.Event),
        });
        return event;
      }),
    );
  }
  @Post('test')
  test(@Body('message') message: string, @HttpCtx() ctx: HTTPContext): void {
    if (!ctx.user?.loggedIn) {
      ctx.res.status(401);
      return;
    }
    this.service.emitToAll<SSE.Payloads.Test>(SSE.Events.Test, {
      user: { id: ctx.user.id, name: ctx.user.name, avatar: ctx.user.avatar },
      message,
    });
  }
}
