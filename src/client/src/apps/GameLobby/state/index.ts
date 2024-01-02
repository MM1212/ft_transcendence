import { usersAtom } from '@hooks/user';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import UsersModel from '@typings/models/users';
import { atom, selector, waitForAll } from 'recoil';

const Targets = PongModel.Endpoints.Targets;

const pongGamesState = new (class GamesState {
  gameLobby = atom<PongModel.Models.ILobby | null>({
    key: 'gameLobby',
    default: selector<PongModel.Models.ILobby | null>({
      key: 'gameLobby/selector',
      get: async () => {
        try {
          const lobby = await tunnel.get(Targets.GetSessionLobby);
          return lobby;
        } catch (e) {
          return null;
        }
      },
    }),
  });
  isInLobby = selector<boolean>({
    key: 'isInLobby',
    get: ({ get }) => {
      return get(this.gameLobby) !== null;
    },
  });
  lobbyOwner = selector<number | null>({
    key: 'lobbyOwner',
    get: ({ get }) => {
      const lobby = get(this.gameLobby);
      if (!lobby) return null;
      return lobby.ownerId;
    },
  });
  isPlaying = selector<boolean>({
    key: 'isPlaying',
    get: ({ get }) => {
      const lobby = get(this.gameLobby);
      if (!lobby) return false;
      return lobby.status === PongModel.Models.LobbyStatus.Playing;
    },
  });
})();

export default pongGamesState;
