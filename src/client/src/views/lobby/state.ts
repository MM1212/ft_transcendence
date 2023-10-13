import { Pixi } from '@hooks/pixiRenderer';
import { sessionAtom } from '@hooks/user';
import { Lobbies } from '@typings/lobby';
import { DefaultValue, atom, selector, useRecoilValue } from 'recoil';

export interface Player extends Lobbies.IPlayer {
  sprite: Pixi.Sprite | null;
}

export interface InitdPlayer extends Omit<Player, 'sprite'> {
  sprite: Pixi.Sprite;
}

export const lobbyPlayersAtom = atom<Player[]>({
  key: 'lobby/players',
  default: [],
  dangerouslyAllowMutability: true,
});

export const lobbyAppAtom = atom<Pixi.Application | null>({
  key: 'lobby/renderer',
  default: null,
  dangerouslyAllowMutability: true,
  effects: [
    ({ getPromise, onSet }) => {
      onSet(async (app) => {
        if (!app || app instanceof DefaultValue) return;
        let lastTick = Date.now();
        const tick = async (delta: number) => {
          const players = await getPromise(lobbyPlayersAtom);
          console.log(delta, Date.now() - lastTick);
          lastTick = Date.now();

          for (const player of players) {
            if (!player.sprite) continue;
            player.transform.position.x += player.transform.velocity.x * delta;
            player.transform.position.y += player.transform.velocity.y * delta;

            player.sprite.x = player.transform.position.x;
            player.sprite.y = player.transform.position.y;
          }
        };
        app.ticker.add(tick);
        return () => {
          app.ticker.remove(tick);
        };
      });
    },
  ],
});

export const lobbyCurrentPlayerSelector = selector<Player | null>({
  key: 'lobby/currentPlayer',
  get: ({ get }) => {
    const session = get(sessionAtom);
    const players = get(lobbyPlayersAtom);
    if (!session) return null;
    return players.find((player) => player.user.id === session.id) ?? null;
  },
  dangerouslyAllowMutability: true,
});

export const useLobbyPlayers = (): Player[] => useRecoilValue(lobbyPlayersAtom);

export const useCurrentLobbyPlayer = (): Player | null =>
  useRecoilValue(lobbyCurrentPlayerSelector);
