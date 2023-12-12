import { useRecoilCallback } from 'recoil';
import pongGamesState from '../state';
import { useTunnelEndpoint } from '@hooks/tunnel';
import PongModel from '@typings/models/pong';
import { Sheet, Stack, Typography } from '@mui/joy';
import { alpha } from '@theme';
import { useUser } from '@hooks/user';
import AvatarWithStatus from '@components/AvatarWithStatus';
import ProfileTooltip from '@components/ProfileTooltip';
import tunnel from '@lib/tunnel';
import { navigate } from 'wouter/use-location';
import { useChatPasswordInputModalActions } from '@apps/Chat/modals/ChatPasswordInputModal/hooks/useChatPasswordInputModal';
import notifications from '@lib/notifications/hooks';
import LockIcon from '@components/icons/LockIcon';

function LobbyEntry(lobby: PongModel.Models.ILobbyInfoDisplay) {
  const owner = useUser(lobby.ownerId);

  const { prompt } = useChatPasswordInputModalActions();

  const handleJoinGame = useRecoilCallback(
    (ctx) => async () => {
      try {
        let pass: string | null = null;
        if (lobby.authorization === PongModel.Models.LobbyAccess.Protected) {
          console.log('prompting for password');
          pass = await prompt({
            chatName: lobby.name,
          });
          if (!pass) return;
        }
        const lobbyJoined = await tunnel.post(
          PongModel.Endpoints.Targets.JoinLobby,
          {
            lobbyId: lobby.id,
            password: pass,
          }
        );
        if (lobbyJoined === null) return;
        navigate('/pong/play/create', { replace: true });
        ctx.set(pongGamesState.gameLobby, lobbyJoined);
      } catch (error) {
        notifications.error('Failed to join lobby', (error as Error).message);
      }
    },
    [lobby.id, lobby.authorization, lobby.name, prompt]
  );
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
        <Typography level="body-sm"
        endDecorator={lobby.authorization === PongModel.Models.LobbyAccess.Protected && <LockIcon size="xs" />}>{lobby.name}</Typography>
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