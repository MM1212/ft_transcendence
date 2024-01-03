import ChatsModel from '@typings/models/chat';
import { ChatDefaultMessageBubbleProps } from './Default';
import Bubble from '../Bubble';
import { Avatar, Badge, Button, Skeleton, Stack, Typography } from '@mui/joy';
import LockIcon from '@components/icons/LockIcon';
import React, { useCallback } from 'react';
import AlertIcon from '@components/icons/AlertIcon';
import { useRecoilValue } from 'recoil';
import { useTunnelEndpoint } from '@hooks/tunnel';
import { randomInt } from '@utils/random';
import pongGamesState from '@apps/GameLobby/state';
import { useCurrentUser } from '@hooks/user';
import PongModel from '@typings/models/pong';
import { navigate } from 'wouter/use-location';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import { useLobbyActions } from '@apps/GameLobby/hooks/actions';

interface IChatEmbedAttachmentsBubbleProps
  extends ChatDefaultMessageBubbleProps {
  embed: ChatsModel.Models.Embeds.GameInvite;
}

function _InviteSkeleton(): JSX.Element {
  return (
    <>
      <Typography level="title-sm" component="div">
        <Skeleton>Chat Invite</Skeleton>
      </Typography>
      <Stack spacing={1} alignItems="center" direction="row" width="100%">
        <Avatar size="lg">
          <Skeleton variant="circular" />
        </Avatar>
        <Stack spacing={0.1} height="100%" justifyContent="center" flexGrow={1}>
          <Typography level="title-sm">
            <Skeleton>{'0'.repeat(randomInt(10, 20))}</Skeleton>
          </Typography>
          <Typography level="body-xs" color="neutral">
            <Skeleton>{'0'.repeat(randomInt(6, 10))}</Skeleton>
          </Typography>
        </Stack>
      </Stack>
    </>
  );
}

const InviteSkeleton = React.memo(_InviteSkeleton);
const brokenInvitesCache = new Set<string>();
function _ChatEmbedGameInviteBubble({
  embed,
  ...props
}: IChatEmbedAttachmentsBubbleProps) {
  const { data, error, isLoading } =
    useTunnelEndpoint<PongModel.Endpoints.GetLobby>(
      brokenInvitesCache.has(`${embed.lobbyId}.${embed.nonce}`)
        ? null
        : PongModel.Endpoints.Targets.GetLobby,
      { id: embed.lobbyId, nonce: embed.nonce },
      { revalidateOnFocus: false, shouldRetryOnError: false }
    );

  const myLobby = useRecoilValue(pongGamesState.gameLobby);
  const self = useCurrentUser();
  const joined = React.useMemo(() => {
    if (!myLobby) return false;
    const players = myLobby.teams[0].players
      .concat(myLobby.teams[1].players)
      .concat(myLobby.spectators);
    return players.some((p) => p.id === self?.id);
  }, [myLobby, self]);

  const deleted = !isLoading && (!!error || !data || data.status === 'error');

  React.useEffect(() => {
    if (deleted) brokenInvitesCache.add(`${embed.lobbyId}.${embed.nonce}`);
  }, [deleted, embed.lobbyId, embed.nonce]);

  const { joinGame } = useLobbyActions();

  const lobby = !error && data?.status === 'ok' ? data.data : undefined;
  const [loading, setLoading] = React.useState(false);
  const attemptToJoin = useCallback(
     async () => {
      if (joined) return navigate('/pong/play/');
      if (!lobby) return;

      const lobbyJoined = await joinGame(
        lobby.id,
        embed.nonce,
        lobby.authorization,
        lobby.name,
      );
      if (!lobbyJoined) return;
      navigate('/pong/play/');

      setLoading(false);
    },
    [joined, lobby, embed.nonce, joinGame]
  );

  return (
    <Bubble
      {...props}
      style={{
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '35dvh',
      }}
      mainColor="warning"
    >
      {isLoading ? (
        <InviteSkeleton />
      ) : (
        <>
          <Typography
            level="title-sm"
            component="div"
            sx={{
              fontWeight: 600,
              color: props.isSent
                ? 'var(--joy-palette-common-white)'
                : 'var(--joy-palette-text-warning)',
              width: 'fit-content',
              whiteSpace: 'pre-wrap',
              letterSpacing: '0.05rem',
              wordBreak: 'break-word',
            }}
          >
            Pong Invite
          </Typography>
          <Stack spacing={1} alignItems="center" direction="row" width="100%">
            <Badge
              badgeContent={<LockIcon size="xs" />}
              color="warning"
              badgeInset="14%"
              size="sm"
              variant="plain"
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              invisible={
                lobby?.authorization !== PongModel.Models.LobbyAccess.Protected
              }
              slotProps={{
                badge: {
                  sx: {
                    ...(!props.isSent && {
                      bgcolor: 'background.body',
                    }),
                  },
                },
              }}
            >
              <Avatar size="lg" color={'warning'}>
                {deleted ? <AlertIcon /> : <TableTennisIcon />}
              </Avatar>
            </Badge>
            <Stack
              spacing={0.1}
              height="100%"
              justifyContent="center"
              flexGrow={1}
            >
              {deleted ? (
                <Typography level="title-md">Whoops!</Typography>
              ) : (
                <Typography level="title-sm">{lobby?.name}</Typography>
              )}
              <Typography level="body-xs">
                {deleted
                  ? 'This game no longer exists'
                  : `${lobby?.nPlayers} players`}
              </Typography>
            </Stack>
            {!deleted && (
              <Button
                variant={joined ? 'plain' : 'soft'}
                color="warning"
                sx={{ ml: 'auto' }}
                onClick={attemptToJoin}
                disabled={deleted}
                loading={loading}
              >
                {joined ? 'Joined' : 'Join'}
              </Button>
            )}
          </Stack>
        </>
      )}
    </Bubble>
  );
}

const ChatEmbedGameInviteBubble = React.memo(_ChatEmbedGameInviteBubble);

export default ChatEmbedGameInviteBubble;
