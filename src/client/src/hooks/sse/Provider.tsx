/* eslint-disable react-refresh/only-export-components */
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { AuthModel, SseModel } from '@typings/api/models';
import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { eventCacheAtom, sseConnectedAtom } from './store';
import { mutate } from 'swr';
import { useIsLoggedIn } from '@hooks/user';

const useSseService = () => {
  const eventCache = useRecoilValue(eventCacheAtom);
  const isLoggedIn = useIsLoggedIn();
  const setSseIsConnected = useSetRecoilState(sseConnectedAtom);

  React.useEffect(() => {
    const eventSource = new EventSource(
      buildTunnelEndpoint(SseModel.Endpoints.Targets.Connect),
      {
        withCredentials: true,
      }
    );
    eventSource.onopen = () => {
      setSseIsConnected(true);
      mutate(buildTunnelEndpoint(AuthModel.Endpoints.Targets.Session));
    };
    eventSource.onerror = () =>
      setSseIsConnected(false);
    eventSource.addEventListener('close', () => {
      setSseIsConnected(false);
      console.log('SSE connection closed');
    });
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
      setSseIsConnected(false);
      console.log('SSE connection closed');
      eventSource.close();
    };
  }, [eventCache, isLoggedIn, setSseIsConnected]);
};

export default useSseService;
