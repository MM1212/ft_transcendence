import PongModel from '@typings/models/pong';
import { useRecoilCallback } from 'recoil';
import pongGamesState from '../state';
import { useSseEvent } from '@hooks/sse';

const useLobbyService = () => {
  const onLeaveLobbyEvent = useRecoilCallback(
    (ctx) => async (ev: PongModel.Sse.UpdateLobbyParticipantEvent) => {
      const { data } = ev;
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby || lobby.id !== data.id) return;
      ctx.set(pongGamesState.gameLobby, (prev) => {
        if (!prev) return prev;
        console.log('NEW LOBBY', {
          ...prev,
          ownerId: data.ownerId,
          teams: data.teams,
          spectators: data.spectators,
        });

        return {
          ...prev,
          ownerId: data.ownerId,
          teams: data.teams,
          spectators: data.spectators,
        };
      });
    },
    []
  );
  useSseEvent<PongModel.Sse.UpdateLobbyParticipantEvent>(
    PongModel.Sse.Events.UpdateLobbyParticipants,
    onLeaveLobbyEvent
  );
};

export default useLobbyService;
