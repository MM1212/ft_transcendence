import { SseModel } from '@typings/api/models';
import React from 'react';
import { useRecoilCallback } from 'recoil';
import { eventCacheAtom } from './store';

export interface SseHook {
  on<T, E extends string>(
    type: E,
    listener: (event: SseModel.Models.Event<T, E>) => void | Promise<void>
  ): ((data: Event) => void) | undefined;
  off(type: SseModel.Models.Events, listener: (event: Event) => void): void;
}

const useSse = (): SseHook => {
  const onEvent = useRecoilCallback<
    Parameters<SseHook['on']>,
    ReturnType<SseHook['on']>
  >(
    (ctx) => (event, listener) => {
      const node = ctx.snapshot.getLoadable(eventCacheAtom);
      const { contents: cache, state } = node;
      if (state !== 'hasValue') return undefined;
      const handler = async (data: Event) => {
        const ret = listener(
          (data as unknown as CustomEvent<SseModel.Models.Event>).detail
        );
        if (ret instanceof Promise) await ret;
      };
      cache.addEventListener(event as SseModel.Models.Events, handler);
      return handler;
    },
    []
  );

  const offEvent = useRecoilCallback<
    Parameters<SseHook['off']>,
    ReturnType<SseHook['off']>
  >(
    (ctx) => async (event, listener) => {
      const cache = await ctx.snapshot.getPromise(eventCacheAtom);
      cache.removeEventListener(event as SseModel.Models.Events, listener);
    },
    []
  );

  return {
    on: onEvent as SseHook['on'],
    off: offEvent as SseHook['off'],
  };
};

const useSseEvent = <
  T extends SseModel.Models.Event<K, E>,
  K = unknown,
  E extends SseModel.Models.Events = SseModel.Models.Events,
>(
  event: E,
  callback: (
    event: SseModel.Models.Event<T['data'], E>
  ) => void | Promise<void>,
  deps?: React.DependencyList
): void => {
  const { on, off } = useSse();
  React.useEffect(() => {
    const cookie = on<K, E>(event, callback);
    if (!cookie) return;
    return () => off(event, cookie) as void;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, event, off, on, ...(deps ?? [])]);
};

export { useSse, useSseEvent };
