import { atom, useRecoilValue } from 'recoil';
import { ClientLobby } from '../src/Lobby';
import { InventoryCategory } from '@apps/Customization/state';
import React, { useSyncExternalStore } from 'react';
import { InteractionData, type Interaction } from '../src/Interaction';

const lobbyState = new (class LobbyState {
  instance = atom<ClientLobby | null>({
    key: 'lobby',
    default: null,
    dangerouslyAllowMutability: true,
  });

  showingInteraction = atom<InteractionData[]>({
    key: 'showingInteraction',
    default: [],
  });
})();

export const lobbyAtom = lobbyState.instance;

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
      };
    },
    getLobbyClothes
  );

  return clothes;
};

export const useRegisterInteraction = (interaction: typeof Interaction) => {
  const lobby = useRecoilValue(lobbyAtom);
  React.useEffect(() => {
    if (lobby) {
      lobby.interactions.emplace(interaction);
    }
    return () => {
      if (lobby) {
        lobby.interactions.remove(interaction.ID);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby]);
};

export default lobbyState;
