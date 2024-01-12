import { Box, Button, Stack, Typography } from "@mui/joy";
import LobbyGameTypography from "./LobbyGameTypography";
import ShurikenIcon from "@components/icons/ShurikenIcon";
import LobbbyCustomMatchPlayers from "./LobbyCustomMatchPlayers";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { useCurrentUser } from "@hooks/user";
import React from "react";
// import AddFriendRoom from "./AddFriendRoom";
import { FindMatchWrapper } from "./LobbyMatchMaking";
import LobbyPongButton from "./LobbyPongBottom";
import pongGamesState from "../state";
import notifications from "@lib/notifications/hooks";
import tunnel from "@lib/tunnel";
import PongModel from "@typings/models/pong";
import LogoutIcon from "@components/icons/LogoutIcon";
import AccountPlusIcon from "@components/icons/AccountPlusIcon";
import LobbyPongCustomMatchTabs from "./LobbyPongCustomMatchTabs";
import EyeArrowRightIcon from "@components/icons/EyeArrowRightIcon";
import { LobbySettings } from "./LobbySettings";
import { useModalActions } from "@hooks/useModal";
import {
  ChatSelectedData,
  useChatSelectModalActions,
} from "@apps/Chat/modals/ChatSelectModal/hooks/useChatSelectModal";
import { OpenGameModal } from "@apps/GamePong/PongModal";

export default function LobbyRoom() {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const [leftTeam, rightTeam] = lobby.teams;
  const isPlaying = useRecoilValue(pongGamesState.isPlaying);
  const user = useCurrentUser();
  //const {open} = useModalActions(LobbyInviteId)
  const { select: selectInvites } = useChatSelectModalActions();
  const player = leftTeam.players
    .concat(rightTeam.players)
    .concat(lobby.spectators)
    .find((player) => player.id === user?.id);

  const handleStartMatch = useRecoilCallback(() => async () => {
    try {
      await tunnel.post(PongModel.Endpoints.Targets.StartGame, {
        lobbyId: lobby.id,
      });
      notifications.success("Game is starting soon!");
    } catch {
      console.log("Failed to start game");
      notifications.error("Failed to start game");
    }
  });

  const handleReady = React.useCallback(async () => {
    try {
      await tunnel.post(PongModel.Endpoints.Targets.Ready, {
        lobbyId: lobby.id,
      });
    } catch (error) {
      console.log("Failed to ready up");
    }
  }, [lobby.id]);

  const handleLeaveLobby = useRecoilCallback((ctx) => async () => {
    const notif = notifications.default("Leaving lobby...");
    try {
      const payload = {
        lobbyId: lobby.id,
      };
      await tunnel.put(PongModel.Endpoints.Targets.LeaveLobby, payload);
      notif.update({
        message: "Left lobby successfully!",
        color: "success",
      });

      ctx.set(pongGamesState.gameLobby, null);
      console.log(pongGamesState.gameLobby);
    } catch (error) {
      notifications.error("Failed to leave lobby", (error as Error).message);
    }
  });

  const handleJoinSpectators = React.useCallback(async () => {
    try {
      await tunnel.post(PongModel.Endpoints.Targets.JoinSpectators, {
        lobbyId: lobby.id,
      });
    } catch {
      console.log("Failed to join spectators");
    }
  }, [lobby.id]);

  const handleInviteList = React.useCallback(async () => {
    try {
      const selected = await selectInvites({
        body: "Invite to Lobby:",
        includeDMs: true,
        multiple: true,
        exclude: lobby.teams[0].players
          .concat(lobby.teams[1].players)
          .concat(lobby.spectators)
          .map<ChatSelectedData>((player) => ({
            type: "user",
            id: player.id,
          }))
          .concat(
            lobby.invited.map<ChatSelectedData>((id) => ({
              type: "user",
              id,
            }))
          ),
      });
      if (selected.length === 0) return;
      await tunnel.post(PongModel.Endpoints.Targets.Invite, {
        lobbyId: lobby.id,
        data: selected,
      });
    } catch (error) {
      console.log(error);
    }
  }, [lobby.id, lobby.invited, lobby.spectators, lobby.teams, selectInvites]);

  if (user === null) return null;
  if (player === undefined) return null;
  return (
    <Box
      display="flex"
      justifyContent="space-evenly"
      alignItems="flex-start"
      width="100%"
      height="100%"
      flexDirection="column"
      gap={2}
    >
      <Typography
        variant="outlined"
        color="warning"
        level="title-lg"
        sx={{
          dispaly: "flex",
          alignItems: "left",
          border: "unset",
        }}
      >
        DOJO PONG CUSTOM MATCH
      </Typography>
      <Stack sx={{ ml: "auto" }} direction="row" spacing={1}>
        <Button
          onClick={handleJoinSpectators}
          type="submit"
          color="warning"
          variant="plain"
          startDecorator={<EyeArrowRightIcon />}
          sx={{ justifyContent: "flex-end" }}
        >
          Spectate
        </Button>
        <Button
          type="submit"
          color="warning"
          variant="plain"
          startDecorator={<AccountPlusIcon />}
          sx={{ justifyContent: "flex-end" }}
          onClick={handleInviteList}
        >
          Invite
        </Button>
        <Button
          onClick={handleLeaveLobby}
          type="submit"
          color="warning"
          variant="plain"
          startDecorator={<LogoutIcon />}
          sx={{ justifyContent: "flex-end" }}
        >
          Leave
        </Button>
      </Stack>
      <Stack sx={{ display: "flex", flexDirection: "row" }}>
        <LobbyGameTypography level="body-sm">{lobby.name}</LobbyGameTypography>
        <ShurikenIcon size="xs" sx={{ ml: 1, mr: 1, mt: 0.7 }} />
        {
          <LobbyGameTypography level="body-sm">
            {leftTeam.players.length}v{rightTeam.players.length}
          </LobbyGameTypography>
        }
      </Stack>
      <LobbbyCustomMatchPlayers leftTeam={leftTeam} rightTeam={rightTeam} />
      <Box display="flex" width="100%" flexGrow={1} mt={2} gap={8}>
        <LobbyPongCustomMatchTabs />
          <LobbySettings key={3} />
      </Box>
      {user?.id === lobby.ownerId ? (
        <FindMatchWrapper
          sx={{
            position: "relative",
            m: "auto!important",
          }}
          onClick={handleStartMatch}
        >
          <LobbyPongButton label="Start Match" />
        </FindMatchWrapper>
      ) : (
        <FindMatchWrapper
          sx={{
            position: "relative",
            m: "auto!important",
          }}
          onClick={handleReady}
        >
          <LobbyPongButton
            label={
              player.status === PongModel.Models.LobbyStatus.Ready
                ? "Ready"
                : "Not Ready"
            }
          />
        </FindMatchWrapper>
      )}
      <OpenGameModal isPlaying={isPlaying}></OpenGameModal>
    </Box>
  );
}
