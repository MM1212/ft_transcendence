import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import React from 'react';
import { useRecoilCallback, useRecoilTransaction_UNSTABLE } from 'recoil';

export const useDebounce = <T extends (...args: any[]) => any>(
  value: T,
  delay: number = 500,
  deps: React.DependencyList
): DebouncedFunc<T> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback<T>(
    debounce(value as any, delay) as unknown as T,
    deps
  ) as unknown as DebouncedFunc<T>;
};

interface DebouncedFunc<T extends (...args: any[]) => any> {
  /**
   * Call the original function, but applying the debounce rules.
   *
   * If the debounced function can be run immediately, this calls it and returns its return
   * value.
   *
   * Otherwise, it returns the return value of the last invocation, or undefined if the debounced
   * function was not invoked yet.
   */
  (...args: Parameters<T>): ReturnType<T> | undefined;

  /**
   * Throw away any pending invocation of the debounced function.
   */
  cancel(): void;

  /**
   * If there is a pending invocation of the debounced function, invoke it immediately and return
   * its return value.
   *
   * Otherwise, return the value from the last invocation, or undefined if the debounced function
   * was never invoked.
   */
  flush(): ReturnType<T> | undefined;
}

export const useRecoilDebounceCallback = <T extends (...args: any) => any>(
  value: Parameters<typeof useRecoilCallback<Parameters<T>, ReturnType<T>>>[0],
  delay: number = 500,
  deps: React.DependencyList
): DebouncedFunc<
  ReturnType<typeof useRecoilCallback<Parameters<T>, ReturnType<T>>>
> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useRecoilCallback<Parameters<T>, ReturnType<DebouncedFunc<T>>>(
    debounce(value as any, delay) as any,
    deps
  ) as any;
};

export const useRecoilDebounceTransaction = <T extends (...args: any) => any>(
  value: Parameters<typeof useRecoilTransaction_UNSTABLE<Parameters<T>>>[0],
  delay: number = 500,
  deps: React.DependencyList
): DebouncedFunc<
  ReturnType<typeof useRecoilTransaction_UNSTABLE<Parameters<T>>>
> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useRecoilTransaction_UNSTABLE<Parameters<T>>(
    debounce(value as any, delay) as any,
    deps
  ) as any;
};

export const useThrottle = <T extends Function>(
  value: T,
  delay: number = 500,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback<T>(
    throttle(value as any, delay, { trailing: false }) as unknown as T,
    deps
  );
};

export const useThrottledValue = <T>(
  value: T,
  delay: number = 500,
  deps: React.DependencyList
): T => {
  return useThrottle(() => value, delay, deps)();
};
