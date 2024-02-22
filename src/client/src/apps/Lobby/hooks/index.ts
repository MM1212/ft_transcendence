import { useRecoilValue } from 'recoil';
import lobbyState, { lobbyAtom } from '../state';
import { useSyncExternalStore } from 'react';

export const useIsLobbyLoading = (): boolean => {
  const lobbyRef = useRecoilValue(lobbyAtom);
  return useSyncExternalStore<boolean>(
    (cb) => {
      if (!lobbyRef) return () => void 0;
      lobbyRef.events.on('rerender', cb);
      return () => {
        lobbyRef?.events.off('rerender', cb);
      };
    },
    () => !!lobbyRef?.loading
  );
};

export const useLobbyShowingInteractions = () =>
  useRecoilValue(lobbyState.showingInteractions);