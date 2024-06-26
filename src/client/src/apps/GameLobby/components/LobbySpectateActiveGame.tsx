import { UserAvatar } from '@components/AvatarWithStatus';
import { useRawTunnelEndpoint } from '@hooks/tunnel';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import { Sheet, Stack, Typography } from '@mui/joy';
import { alpha } from '@theme';
import PongModel from '@typings/models/pong';
import { navigate } from 'wouter/use-location';
import pongGamesState from '../state';
import { useRecoilCallback } from 'recoil';
import GenericPlaceholder from '@components/GenericPlaceholder';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import { ProfileTooltipByUserId } from '@components/ProfileTooltip';

function ViewGame(game: PongModel.Models.IGameInfoDisplay) {
  const handleViewGame = useRecoilCallback(
    (ctx) => async () => {
      try {
        const lobbyJoined = await tunnel.post(
          PongModel.Endpoints.Targets.JoinActive,
          {
            uuid: game.UUID,
          }
        );
        if (!lobbyJoined) return;
        ctx.set(pongGamesState.gameLobby, lobbyJoined);
        navigate('/pong/play/', { replace: true });
      } catch (error) {
        notifications.error(
          'Failed to spectate game',
          (error as Error).message
        );
      }
    },
    [game.UUID]
  );

  if (!game) return null;

  return (
    <Sheet
      sx={{
        p: 1,
        px: 2,
        borderRadius: 'md',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'padding', 'margin'], {
            duration: theme.transitions.duration.shortest,
          }),
        backgroundColor: (theme) =>
          alpha(theme.resolveVar('palette-background-surface'), 0.5),
        '&:hover': {
          py: 2,
          cursor: 'pointer',
          backgroundColor: (theme) =>
            alpha(theme.resolveVar('palette-background-surface'), 0.7),
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
        <ProfileTooltipByUserId key={player.userId} userId={player.userId}>
          <UserAvatar src={player.avatar} />
        </ProfileTooltipByUserId>
      ))}
      <Stack spacing={0.25}>
        <Typography>{game.score[0]}</Typography>
      </Stack>
      <Typography>vs</Typography>
      <Stack spacing={0.25}>
        <Typography>{game.score[1]}</Typography>
      </Stack>
      {game.teams[1].players.map((player) => (
        <ProfileTooltipByUserId key={player.userId} userId={player.userId}>
          <UserAvatar src={player.avatar} />
        </ProfileTooltipByUserId>
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

  if (isLoading || error || !data || data.status !== 'ok')
    return <div>Loading...</div>;

  if (!data.data) return <div>No active games</div>;

  const games = data.data.filter(
    (games) =>
      games.spectatorVisibility !==
      PongModel.Models.LobbySpectatorVisibility.None
  );
  return (
    <>
      {games.length > 0 ? (
        <Stack spacing={0.5}>
          {games.map((game) => (
            <ViewGame key={game.UUID} {...game} />
          ))}
        </Stack>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <GenericPlaceholder
            title="No Active Games to Spectate"
            icon={<TableTennisIcon fontSize="xl4" />}
            label="Play a Match"
            path="/pong/play/queue"
          />
        </div>
      )}
    </>
  );
}
