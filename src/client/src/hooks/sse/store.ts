import { atom } from 'recoil';

export const eventCacheAtom = atom<EventTarget>({
  key: 'sse/event-cache',
  default: new EventTarget(),
});

export const sseConnectedAtom = atom<boolean>({
  key: 'sse/connected',
  default: false,
});