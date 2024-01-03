import PongModel from '@typings/models/pong';
import { useRecoilCallback } from 'recoil';
import pongGamesState from '../state';
import { useSseEvent } from '@hooks/sse';
import { useRegisterNotificationTemplate } from '@apps/Inbox/state/hooks';
import NotificationsModel from '@typings/models/notifications';
import TableTennisIcon from '@components/icons/TableTennisIcon';

const useLobbyService = () => {
  const onUpdateLobbyEvent = useRecoilCallback(
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

  const onKickEvent = useRecoilCallback(
    (ctx) => async () => {
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby) return;
      ctx.set(pongGamesState.gameLobby, null);
    },
    []
  );

  const onInviteEvent = useRecoilCallback(
    (ctx) => async (ev: PongModel.Sse.UpdateLobbyInvited) => {
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby) return;
      ctx.set(pongGamesState.gameLobby, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          invited: ev.data.invited,
        };
      });
    },
    []
  );

  const onStartEvent = useRecoilCallback(
    (ctx) => async (ev: PongModel.Sse.Start) => {
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby) return;
      if (lobby.id !== ev.data.id) return;
      ctx.set(pongGamesState.gameLobby, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: ev.data.status,
        };
      });
      console.log('START EVENT', ev.data);
      // navigate (?)
      // open modal
    },
    []
  );

  useRegisterNotificationTemplate<PongModel.Models.NotificationInvite>(
    NotificationsModel.Models.Tags.PongLobbyInvite,
    (ctx) => {
      ctx.setIcon(<TableTennisIcon />);
      ctx.setRouteTo('/pong/play/');
      //ctx.setOnClick
    }
  );

  useSseEvent<PongModel.Sse.Kick>(PongModel.Sse.Events.Kick, onKickEvent);
  useSseEvent<PongModel.Sse.UpdateLobbyParticipantEvent>(
    PongModel.Sse.Events.UpdateLobbyParticipants,
    onUpdateLobbyEvent
  );
  useSseEvent<PongModel.Sse.UpdateLobbyInvited>(
    PongModel.Sse.Events.UpdateLobbyInvited,
    onInviteEvent
  );
  useSseEvent<PongModel.Sse.Start>(PongModel.Sse.Events.Start, onStartEvent);
};

export default useLobbyService;
