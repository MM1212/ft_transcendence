import { atom, selector, useRecoilValue } from 'recoil';
import { ClientLobby } from '../src/Lobby';
import { InventoryCategory } from '@apps/Customization/state';
import React, { useSyncExternalStore } from 'react';

export const lobbyAtom = atom<ClientLobby | null>({
  key: 'lobby',
  default: null,
  dangerouslyAllowMutability: true,
});

export const lobbyMainClothesAtom = selector<Record<InventoryCategory, number>>(
  {
    key: 'lobbyMainClothes',
    get: ({ get }) => {
      const lobby = get(lobbyAtom);
      if (!lobby || !lobby.mainPlayer) return {} as any;
      return lobby.mainPlayer.character.clothes;
    },
  }
);

const DEFAULT_CLOTHES = {
  color: 1,
  face: -1,
  head: -1,
  body: -1,
  feet: -1,
  hand: -1,
  neck: -1,
};

export const useLobbyPenguinClothes = (): Record<InventoryCategory, number> => {
  const lobby = useRecoilValue(lobbyAtom);

  const getLobbyClothes = React.useCallback(
    () => lobby?.mainPlayer?.character.clothes ?? DEFAULT_CLOTHES,
    [lobby]
  );
  const clothes = useSyncExternalStore<Record<InventoryCategory, number>>(
    (cb) => {
      lobby?.events.on('self:clothes:update', cb);
      lobby?.events.on('rerender', cb);
      return () => {
        lobby?.events.off('self:clothes:update', cb);
        lobby?.events.off('rerender', cb);
      }
    },
    getLobbyClothes
  );

  return clothes;
};
