import React from 'react';
import { useRecoilValue } from 'recoil';
import { socketStorageAtom } from './state';

export const useSocket = (url: string) => {
  const sock = useRecoilValue(socketStorageAtom(url));

  const status: 'connected' | 'disconnected' = sock.connected
    ? 'connected'
    : 'disconnected';

  const useMounter = (connect: boolean = true) => {
    React.useEffect(() => {
      if (connect) sock.connect();
      return () => {
        sock.disconnect();
      };
    }, [connect]);
  };

  const emit = React.useCallback(
    <T extends unknown[]>(event: string, ...args: T) => {
      sock.emit(event, ...args);
    },
    [sock]
  );

  const useListener = <T extends unknown[]>(
    event: string,
    handler: (...args: T) => void,
    deps: React.DependencyList = []
  ) => {
    React.useEffect(() => {
      sock.on(event, handler as (...args: unknown[]) => void);
      return () => {
        sock.off(event, handler as (...args: unknown[]) => void);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, handler, ...deps]);
  };

  return {
    status,
    connected: sock.connected,
    useMounter,
    emit,
    useListener,
  };
};
