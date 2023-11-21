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

type ChatListItemProps = {
  id: number;
};

export default function ChatListItem({ id }: ChatListItemProps) {
  const { goTo, useIsSelected, useSelfParticipant, useInfo } = useChat(id);
  const {
    lastMessage,
    lastMessageAuthorName,
    name,
    photo,
    createdAt,
    status,
    type,
  } = useInfo();
  const isSelected = useIsSelected();

  const participant = useSelfParticipant();
  const timestamp = lastMessage?.createdAt ?? createdAt;
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
            <Stack direction="row" spacing={1} alignItems="center" width="100%">
              {type === ChatsModel.Models.ChatType.Direct ? (
                <AvatarWithStatus
                  status={status}
                  src={photo ?? undefined}
                  size="lg"
                  inset=".5rem"
                />
              ) : (
                <Avatar src={photo ?? undefined} size="lg" />
              )}
              <Stack spacing={0.25} width="100%">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography level="title-sm">{name}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {participant.toReadPings !== 0 && (
                      <CircleIcon
                        sx={{ fontSize: 8, color: 'primary.plainColor' }}
                      />
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
          </ListItemButton>
        </ListItem>
        <ListDivider sx={{ margin: 0 }} />
      </>
    ),
    [
      goTo,
      isSelected,
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
