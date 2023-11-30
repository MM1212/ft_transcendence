import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import React from 'react';

export const useDebounce = <T extends Function>(
  value: T,
  delay: number = 500,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback<T>(
    debounce(value as any, delay) as unknown as T,
    deps
  );
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

export const useDebouncedValue = <T>(
  value: T,
  delay: number = 500,
  deps: React.DependencyList
): T => {
  return useDebounce(() => value, delay, deps)();
};

export const useThrottledValue = <T>(
  value: T,
  delay: number = 500,
  deps: React.DependencyList
): T => {
  return useThrottle(() => value, delay, deps)();
};

