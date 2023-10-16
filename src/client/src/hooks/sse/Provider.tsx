/* eslint-disable react-refresh/only-export-components */
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { SseModel } from '@typings/api/models';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { eventCacheAtom } from './store';

function useSseService() {
  const eventCache = useRecoilValue(eventCacheAtom);
  React.useEffect(() => {
    const eventSource = new EventSource(
      buildTunnelEndpoint(SseModel.Endpoints.Targets.Connect),
      {
        withCredentials: true,
      }
    );
    eventSource.onopen = () =>
      console.log('SSE connection opened', eventSource.readyState);
    eventSource.addEventListener('close', () =>
      console.log('SSE connection closed')
    );
    eventSource.addEventListener('message', (raw: MessageEvent<string>) => {
      console.log(raw);
      const { data } = raw;
      const event = JSON.parse(data) as SseModel.Models.Event;
      const [, ..._type] = event.type.split('.');
      event.type = _type.join('.') as SseModel.Models.Event['type'];
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
}

export function SseMounter(): null {
  useSseService();
  return null;
}
