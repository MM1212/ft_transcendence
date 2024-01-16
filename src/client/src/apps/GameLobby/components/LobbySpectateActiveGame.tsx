import { UserAvatar } from "@components/AvatarWithStatus";
import { useRawTunnelEndpoint } from "@hooks/tunnel";
import notifications from "@lib/notifications/hooks";
import tunnel from "@lib/tunnel";
import { Sheet, Stack, Typography } from "@mui/joy";
import { alpha } from "@theme";
import PongModel from "@typings/models/pong";
import { useCallback } from "react";
import { navigate } from "wouter/use-location";

function ViewGame(game: PongModel.Models.IGameInfoDisplay) {
  const handleViewGame = useCallback(async () => {
    try {
      await tunnel.post(PongModel.Endpoints.Targets.JoinActive, {
        uuid: game.UUID,
      });
      navigate("/pong/play/", { replace: true });
    } catch (error) {
      notifications.error("Failed to spectate game", (error as Error).message);
    }
  }, [game.UUID]);

  return (
    <Sheet
      sx={{
        p: 1,
        px: 2,
        borderRadius: "md",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: (theme) =>
          theme.transitions.create(["background-color", "padding", "margin"], {
            duration: theme.transitions.duration.shortest,
          }),
        backgroundColor: (theme) =>
          alpha(theme.resolveVar("palette-background-surface"), 0.5),
        "&:hover": {
          py: 2,
          cursor: "pointer",
          backgroundColor: (theme) =>
            alpha(theme.resolveVar("palette-background-surface"), 0.7),
        },
      }}
      variant="outlined"
      key={game.UUID}
      onClick={handleViewGame}
    >
      <Stack spacing={0.25}>
        <Typography>Max score: {game.maxScore}</Typography>
      </Stack>
      {game.teams[0].players.map((player) => (
        <UserAvatar src={player.avatar} key={player.userId} />
      ))}
      <Stack spacing={0.25}>
        <Typography>{game.score[0]}</Typography>
      </Stack>
      <Typography>vs</Typography>
      <Stack spacing={0.25}>
        <Typography>{game.score[1]}</Typography>
      </Stack>
      {game.teams[1].players.map((player) => (
        <UserAvatar src={player.avatar} key={player.userId} />
      ))}
    </Sheet>
  );
}

export function LobbySpectateActiveGame() {
  const { isLoading, data, error } =
    useRawTunnelEndpoint<PongModel.Endpoints.GetAllGames>(
      PongModel.Endpoints.Targets.GetAllGames,
      { revalidateOnFocus: false, refreshInterval: 5000 }
    );

  if (isLoading || error || !data || data.status !== "ok")
    return <div>Loading...</div>;

  if (!data.data) return <div>No active games</div>;

  const games = data.data.filter(
    (games) =>
      games.spectatorVisibility !==
      PongModel.Models.LobbySpectatorVisibility.None
  );
  return (
    <Stack spacing={0.5}>
      {games.map((game) => (
        <ViewGame key={game.UUID} {...game} />
      ))}
    </Stack>
  );
}
