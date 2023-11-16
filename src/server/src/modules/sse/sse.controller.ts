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
import { Auth } from '@/modules/auth/decorators';
import { SseAuth } from './decorators';

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
  @SseAuth()
  connect(
    @HttpCtx() ctx: HTTPContext<true>,
    @OnConnectionClosed() onClosed: Observable<void>,
  ): Observable<MessageEvent> {
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
        if (this.clients.some((c) => c.id === user.id)) return;
        this.service.local.emit('sse.disconnected', user.id);
      },
    });
    this.service.local.emit('sse.connected', user.id);
    return observer.pipe(
      map((data) => {
        const event = new MessageEvent('message', {
          lastEventId: `sse/${client.handle}/${data.event}/${Date.now()}`,
          data: JSON.stringify({
            data: data.data,
            source: data.source,
            type: data.event,
          } as SSE.Models.Event),
        });
        return event;
      }),
    );
  }
  @Post('test')
  @Auth()
  test(@Body('message') message: string, @HttpCtx() ctx: HTTPContext<true>) {
    this.service.emitToAll<SSE.DTO.Test>('test', {
      user: {
        id: ctx.user.id,
        name: ctx.user.nickname,
        avatar: ctx.user.avatar,
      },
      message,
    });
  }
}
