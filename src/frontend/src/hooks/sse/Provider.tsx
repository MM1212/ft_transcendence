/* eslint-disable react-refresh/only-export-components */
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { Endpoints } from '@typings/api';
import { SSE } from '@typings/api/sse';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { eventCacheAtom } from './store';

function SseProvider({ children }: React.PropsWithChildren<{}>): JSX.Element {
  const eventCache = useRecoilValue(eventCacheAtom);
  React.useEffect(() => {
    const eventSource = new EventSource(buildTunnelEndpoint(Endpoints.Sse), {
      withCredentials: true,
    });
    eventSource.onopen = () =>
      console.log('SSE connection opened', eventSource.readyState);
    eventSource.addEventListener('close', () =>
      console.log('SSE connection closed')
    );
    eventSource.addEventListener('message', (raw: MessageEvent<string>) => {
      console.log(raw);
      const { data } = raw;
      const event = JSON.parse(data) as SSE.Event;
      const [, ..._type] = event.type.split('.');
      event.type = _type.join('.') as SSE.Event['type'];
      eventCache.dispatchEvent(
        new CustomEvent(event.type, {
          detail: event,
        })
      );
    });
    return () => {
      console.log('SSE connection closed');
      eventSource.close();
    };
  }, [eventCache]);
  return <>{children}</>;
}

export default React.memo(SseProvider);
