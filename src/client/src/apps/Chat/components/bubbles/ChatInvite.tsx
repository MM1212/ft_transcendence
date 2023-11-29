import ChatsModel from '@typings/models/chat';
import { ChatDefaultMessageBubbleProps } from './Default';
import Bubble from '../Bubble';
import { Avatar, Badge, Button, Skeleton, Stack, Typography } from '@mui/joy';
import useChat from '@apps/Chat/hooks/useChat';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import LockIcon from '@components/icons/LockIcon';
import React from 'react';
import chatsState from '@apps/Chat/state';
import AlertIcon from '@components/icons/AlertIcon';
import { useRecoilValue } from 'recoil';
import { useTunnelEndpoint } from '@hooks/tunnel';
import { randomInt } from '@utils/random';

interface IChatEmbedAttachmentsBubbleProps
  extends ChatDefaultMessageBubbleProps {
  embed: ChatsModel.Models.Embeds.ChatInvite;
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

function _ChatEmbedChatInviteBubble({
  embed,
  ...props
}: IChatEmbedAttachmentsBubbleProps) {
  const { data, error, isLoading } =
    useTunnelEndpoint<ChatsModel.Endpoints.GetChatInfo>(
      ChatsModel.Endpoints.Targets.GetChatInfo,
      { chatId: embed.chatId },
      { revalidateOnFocus: false }
    );
  const { attemptToJoin: _attemptToJoin } = useChat(embed.chatId);
  const chats = useRecoilValue(chatsState.chats);
  const joined = React.useMemo(
    () => chats.includes(embed.chatId),
    [embed.chatId, chats]
  );
  const deleted = !!error || !data || data.status === 'error';
  const chat = !error && data?.status === 'ok' ? data.data : undefined;
  const [loading, setLoading] = React.useState(false);
  const attemptToJoin = React.useCallback(async () => {
    if (joined) return;
    setLoading(true);

    await _attemptToJoin({
      id: props.messageId,
      nonce: embed.inviteNonce,
    });
    setLoading(false);
  }, [joined, _attemptToJoin, props.messageId, embed.inviteNonce]);

  return (
    <Bubble
      {...props}
      style={{
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '35dvh',
      }}
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
                : 'var(--joy-palette-text-primary)',
              width: 'fit-content',
              whiteSpace: 'pre-wrap',
              letterSpacing: '0.05rem',
              wordBreak: 'break-word',
            }}
          >
            Chat Invite
          </Typography>
          <Stack spacing={1} alignItems="center" direction="row" width="100%">
            <Badge
              badgeContent={<LockIcon size="xs" />}
              color="primary"
              badgeInset="14%"
              size="sm"
              variant="plain"
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              invisible={
                chat?.authorization !== ChatsModel.Models.ChatAccess.Private
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
              <Avatar
                src={chat?.photo ?? undefined}
                size="lg"
                color={props.isSent ? 'primary' : 'neutral'}
              >
                {deleted ? <AlertIcon /> : <AccountGroupIcon />}
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
                <Typography level="title-sm">{chat?.name}</Typography>
              )}
              <Typography level="body-xs">
                {deleted
                  ? 'This chat no longer exists'
                  : `${chat?.participantsCount} members`}
              </Typography>
            </Stack>
            <Button
              variant={joined ? 'plain' : 'soft'}
              color="primary"
              sx={{ ml: 'auto' }}
              onClick={attemptToJoin}
              disabled={deleted}
              loading={loading}
            >
              {joined ? 'Joined' : 'Join'}
            </Button>
          </Stack>
        </>
      )}
    </Bubble>
  );
}

const ChatEmbedChatInviteBubble = React.memo(_ChatEmbedChatInviteBubble);

export default ChatEmbedChatInviteBubble;
