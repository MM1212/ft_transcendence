import { useTunnelEndpoint } from '@hooks/tunnel';
import PongModel from '@typings/models/pong';
import { Sheet, Stack, Typography } from '@mui/joy';
import { alpha } from '@theme';
import { useUser } from '@hooks/user';
import AvatarWithStatus from '@components/AvatarWithStatus';
import ProfileTooltip from '@components/ProfileTooltip';
import { navigate } from 'wouter/use-location';
import LockIcon from '@components/icons/LockIcon';
import { useLobbyActions } from '../hooks/actions';
import { useCallback } from 'react';

function LobbyEntry(lobby: PongModel.Models.ILobbyInfoDisplay) {
  const owner = useUser(lobby.ownerId);

  const { joinGame } = useLobbyActions();

  const handleJoinGame = useCallback(async () => {
    const joined = await joinGame(lobby.id, lobby.authorization, lobby.name);
    if (!joined) return;
    navigate('/pong/play/', { replace: true });
  }, [lobby.id, lobby.authorization, lobby.name, joinGame]);

  if (owner === null) return null;
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
      key={lobby.id}
      onClick={handleJoinGame}
    >
      <Stack spacing={0.25}>
        <Typography level="title-sm">Lobby Name</Typography>
        <Typography
          level="body-sm"
          endDecorator={
            lobby.authorization === PongModel.Models.LobbyAccess.Protected && (
              <LockIcon size="xs" />
            )
          }
        >
          {lobby.name}
        </Typography>
      </Stack>
      <Stack spacing={0.25}>
        <Typography level="title-sm">Owner</Typography>
        <Stack spacing={1} direction="row" alignItems="center">
          <ProfileTooltip user={owner} placement="left-start">
            <AvatarWithStatus
              src={owner.avatar}
              status={owner.status}
              size="sm"
            />
          </ProfileTooltip>
          <Typography level="body-sm">{owner.nickname}</Typography>
        </Stack>
      </Stack>
      <Stack spacing={0.25}>
        <Typography level="title-sm">Players</Typography>
        <Typography level="body-sm">{lobby.nPlayers}</Typography>
      </Stack>
      <Stack spacing={0.25}>
        <Typography level="title-sm">Spectators</Typography>
        <Typography level="body-sm">{lobby.spectators}</Typography>
      </Stack>
    </Sheet>
  );
}

export default function LobbyJoinCustom() {
  const { isLoading, data, error } =
    useTunnelEndpoint<PongModel.Endpoints.GetAllLobbies>(
      PongModel.Endpoints.Targets.GetAllLobbies,
      { active: false },
      { revalidateOnFocus: false, refreshInterval: 5000 }
    );

  if (isLoading || error || !data || data.status !== 'ok')
    return <div>Loading...</div>;

  return (
    <Stack spacing={0.5}>
      {data.data.map((lobby) => (
        <LobbyEntry key={lobby.id} {...lobby} />
      ))}
    </Stack>
  );
}
