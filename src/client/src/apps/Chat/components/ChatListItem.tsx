import React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from '@components/AvatarWithStatus';
import { useRecoilState, useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import CircleIcon from '@components/icons/CircleIcon';
import { Avatar } from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import moment from 'moment';

type ChatListItemProps = {
  id: number;
};

export default function ChatListItem({ id }: ChatListItemProps) {
  const [selected, setSelected] = useRecoilState(chatsState.isChatSelected(id));
  const {
    lastMessage,
    lastMessageAuthorName,
    name,
    photo,
    createdAt,
    status,
    type,
  } = useRecoilValue(chatsState.chatInfo(id));

  const participant = useRecoilValue(chatsState.selfParticipantByChat(id));
  if (!participant) return null;
  const timestamp = lastMessage?.createdAt ?? createdAt;
  return (
    <React.Fragment>
      <ListItem>
        <ListItemButton
          onClick={() => {
            setSelected(true);
          }}
          selected={selected}
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
    </React.Fragment>
  );
}
