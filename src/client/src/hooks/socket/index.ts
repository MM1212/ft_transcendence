import React, { useSyncExternalStore } from 'react';
import { useRecoilValue } from 'recoil';
import { socketStorageAtom } from './state';

export const useSocket = (url: string) => {
  const sock = useRecoilValue(socketStorageAtom(url));
  const status = useSyncExternalStore<boolean>(
    (cb) => {
      sock.on('connect', cb);
      sock.on('disconnect', cb);
      return () => {
        sock.off('connect', cb);
        sock.off('disconnect', cb);
      };
    },
    () => sock.connected
  );

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

  const emitWithAck = React.useCallback(
    <T extends unknown[]>(event: string, ...args: T) =>
      sock.emitWithAck(event, ...args),
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

  const useListenerWithAck = <T extends unknown[]>(
    event: string,
    handler: (...args: T) => void,
    deps: React.DependencyList = []
  ) => {
    React.useEffect(() => {
      const cb = (...args: T) => {
        const callback = args.pop() as () => void;
        Promise.resolve(handler(...args)).then(callback);
      };
      sock.on(event, cb as (...args: unknown[]) => void);
      return () => {
        sock.off(event, cb as (...args: unknown[]) => void);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, handler, ...deps]);
  };

  return {
    status,
    socket: sock,
    connected: sock.connected,
    useMounter,
    emit,
    emitWithAck,
    useListener,
    useListenerWithAck,
  };
};
