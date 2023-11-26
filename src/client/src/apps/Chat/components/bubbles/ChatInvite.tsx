import ChatsModel from '@typings/models/chat';
import { ChatDefaultMessageBubbleProps } from './Default';
import Bubble from '../Bubble';
import { Avatar, Badge, Button, Stack, Typography } from '@mui/joy';
import useChat from '@apps/Chat/hooks/useChat';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import LockIcon from '@components/icons/LockIcon';

interface IChatEmbedAttachmentsBubbleProps
  extends ChatDefaultMessageBubbleProps {
  embed: ChatsModel.Models.Embeds.ChatInvite;
}

export default function ChatEmbedChatInviteBubble({
  embed,
  ...props
}: IChatEmbedAttachmentsBubbleProps) {
  const { useInfo, useSelfParticipant } = useChat(embed.chatId);
  const { name, photo, participantCount, authorization } = useInfo();

  const joined = !!useSelfParticipant();
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
          invisible={authorization !== ChatsModel.Models.ChatAccess.Private}
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
          <Avatar src={photo ?? undefined} size="lg">
            <AccountGroupIcon />
          </Avatar>
        </Badge>
        <Stack spacing={0.1} height="100%" justifyContent="center" flexGrow={1}>
          <Typography level="title-sm">{name}</Typography>
          <Typography level="body-xs">{participantCount} members</Typography>
        </Stack>
        <Button
          variant={joined ? 'plain' : 'soft'}
          color="primary"
          sx={{ ml: 'auto' }}
        >
          {joined ? 'Joined' : 'Join'}
        </Button>
      </Stack>
    </Bubble>
  );
}
