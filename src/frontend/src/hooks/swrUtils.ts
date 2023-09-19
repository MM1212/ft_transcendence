import { mutate } from 'swr';

export const clearSwrCache = (key: string) =>
  mutate(key, undefined, { revalidate: false });

export const clearAllSwrCache = () =>
  mutate(() => true, undefined, { revalidate: false });