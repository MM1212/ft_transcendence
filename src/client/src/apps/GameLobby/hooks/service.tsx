import PongModel from "@typings/models/pong";
import { useRecoilCallback } from "recoil";
import pongGamesState from "../state";
import { useSseEvent } from "@hooks/sse";
import { useRegisterNotificationTemplate } from "@apps/Inbox/state/hooks";
import NotificationsModel from "@typings/models/notifications";
import TableTennisIcon from "@components/icons/TableTennisIcon";
import { useLobbyActions } from "./actions";
import { navigate } from "wouter/use-location";

const useLobbyService = () => {
  // can this be here?
  const { joinGame } = useLobbyActions();

  const onUpdateLobbyEvent = useRecoilCallback(
    (ctx) => async (ev: PongModel.Sse.UpdateLobbyParticipantEvent) => {
      const { data } = ev;
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby || lobby.id !== data.id) return;
      ctx.set(pongGamesState.gameLobby, (prev) => {
        if (!prev) return prev;
        console.log("NEW LOBBY", {
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

  const onUpdateSettingsEvent = useRecoilCallback(
    (ctx) => async (ev: PongModel.Sse.UpdateLobbySettings) => {
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby) return;
      if (lobby.id !== ev.data.lobbyId) return;
      ctx.set(pongGamesState.gameLobby, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          score: ev.data.score,
          gameType:
            ev.data.type === true
              ? PongModel.Models.LobbyGameType.Powers
              : PongModel.Models.LobbyGameType.Classic,
          ballSkin: ev.data.ballSkin,
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

  const onLeaveEvent = useRecoilCallback(
    (ctx) => async () => {
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby) return;
      ctx.set(pongGamesState.gameLobby, null);
    },
    []
  );

  const onJoinEvent = useRecoilCallback(
    (ctx) => async (ev: PongModel.Sse.Join) => {
      const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
      if (!lobby) {
        ctx.set(pongGamesState.gameLobby, ev.data);
      }
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
      console.log("START EVENT", ev.data);
      // navigate (?)
      // open modal
    },
    []
  );

  useRegisterNotificationTemplate<PongModel.Models.NotificationInvite>(
    NotificationsModel.Models.Tags.PongLobbyInvite,
    (ctx) => {
      ctx.setIcon(<TableTennisIcon />);
      ctx.setOnClick(async (notif) => {
        const data = notif.data;
        const newlobby = await joinGame(
          data.lobbyId,
          data.nonce,
          data.authorization,
          "Enter lobby "
        );
        if (!newlobby) return;
        navigate(`/pong/play/`);
      });
    }
  );

  useSseEvent<PongModel.Sse.Join>(PongModel.Sse.Events.Join, onJoinEvent);
  useSseEvent<PongModel.Sse.Leave>(PongModel.Sse.Events.Leave, onLeaveEvent);

  useSseEvent<PongModel.Sse.Kick>(PongModel.Sse.Events.Kick, onKickEvent);
  useSseEvent<PongModel.Sse.UpdateLobbyParticipantEvent>(
    PongModel.Sse.Events.UpdateLobbyParticipants,
    onUpdateLobbyEvent
  );
  useSseEvent<PongModel.Sse.UpdateLobbySettings>(
    PongModel.Sse.Events.UpdateLobbySettings,
    onUpdateSettingsEvent
  );
  useSseEvent<PongModel.Sse.UpdateLobbyInvited>(
    PongModel.Sse.Events.UpdateLobbyInvited,
    onInviteEvent
  );
  useSseEvent<PongModel.Sse.Start>(PongModel.Sse.Events.Start, onStartEvent);
};

export default useLobbyService;
