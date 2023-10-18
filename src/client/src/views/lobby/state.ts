import { Pixi } from '@hooks/pixiRenderer';
import { sessionAtom } from '@hooks/user';
import { Lobbies } from '@typings/lobby';
import { atom, selector, useRecoilValue } from 'recoil';


export interface Player extends Lobbies.IPlayer {
  sprite: Pixi.Sprite | null;
  nickNameText: Pixi.Text | null;
  allowMove: boolean;
}

export interface InitdPlayer extends Omit<Player, 'sprite'> {
  sprite: Pixi.Sprite;
  nickNameText: Pixi.Text;
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

// Lets create a context that will keep the state of an element

export const allowPlayerMove = atom<boolean>({
	  key: 'lobby/drawerOpen',
  default: false,
});

export const allowPlayerFocus = atom<boolean>({
	key: 'lobby/drawerOpen',
default: false,
});


export const useLobbyPlayers = (): Player[] => useRecoilValue(lobbyPlayersAtom);

export const useCurrentLobbyPlayer = (): Player | null =>
  useRecoilValue(lobbyCurrentPlayerSelector);

// Lets create an arrow function that returns a reference to an Input element

//export const getInputRef = (): React.RefObject<HTMLInputElement> => {
 // const inputRef = React.useRef<HTMLInputElement>(null);
 // return inputRef;
//}