import React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from '@components/AvatarWithStatus';
import CircleIcon from '@components/icons/CircleIcon';
import { Avatar } from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import moment from 'moment';
import useChat from '../hooks/useChat';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';

type ChatListItemProps = {
  id: number;
  last: boolean;
};

function ChatListContent({ id }: { id: number }): JSX.Element {
  const { useInfo, useSelfParticipant } = useChat(id);
  const {
    lastMessage,
    lastMessageAuthorName,
    name,
    photo,
    createdAt,
    status,
    type,
  } = useInfo();

  const participant = useSelfParticipant();
  const timestamp = lastMessage?.createdAt ?? createdAt;
  return React.useMemo(
    () => (
      <Stack direction="row" spacing={1} alignItems="center" width="100%">
        {type === ChatsModel.Models.ChatType.Direct ? (
          <AvatarWithStatus
            status={status}
            src={photo ?? undefined}
            size="lg"
          />
        ) : (
          <Avatar src={photo ?? undefined} size="lg" >
            <AccountGroupIcon />
          </Avatar>
        )}
        <Stack spacing={0.25} width="100%">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="25dvh"
          >
            <Typography level="title-sm">{name}</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {participant.toReadPings !== 0 && (
                <CircleIcon sx={{ fontSize: 8, color: 'primary.plainColor' }} />
              )}
              <Typography
                level="body-xs"
                display={{ xs: 'none', md: 'block' }}
                noWrap
              >
                {moment(timestamp).fromNow()}
              </Typography>
            </Stack>
          </Box>
          {lastMessage && (
            <Typography
              level="body-sm"
              component="span"
              sx={{
                whiteSpace: 'nowrap',
                width: '25dvh',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {lastMessageAuthorName && `${lastMessageAuthorName}: `}
              {lastMessage.message}
            </Typography>
          )}
        </Stack>
      </Stack>
    ),
    [
      lastMessage,
      lastMessageAuthorName,
      name,
      participant.toReadPings,
      photo,
      status,
      timestamp,
      type,
    ]
  );
}

function _ChatListItem({ id, last }: ChatListItemProps) {
  const { goTo, useIsSelected } = useChat(id);

  const isSelected = useIsSelected();
  return React.useMemo(
    () => (
      <>
        <ListItem>
          <ListItemButton
            onClick={goTo}
            selected={isSelected}
            color="neutral"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'initial',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <ChatListContent id={id} />
          </ListItemButton>
        </ListItem>
        {!last && <ListDivider sx={{ margin: 0 }} />}
      </>
    ),
    [goTo, id, isSelected, last]
  );
}

const ChatListItem = React.memo(_ChatListItem);
export default ChatListItem;
