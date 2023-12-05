import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import { atom, selector } from 'recoil';

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
      }
    }),
  });
  isInLobby = selector<boolean>({
    key: 'isInLobby',
    get: ({ get }) => {
      return get(this.gameLobby) !== null;
    },
  });
})();

export default pongGamesState;
