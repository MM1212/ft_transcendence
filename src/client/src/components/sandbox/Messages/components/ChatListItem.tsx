import React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from './AvatarWithStatus';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { ChatProps, MessageProps, UserProps } from '../types';
import { toggleMessagesPane } from '../utils';
import Icon from '@components/Icon';
import { useRecoilState, useRecoilValue } from 'recoil';
import chatsState from '../state';

type ChatListItemProps = {
  id: number;
};

export default function ChatListItem({ id }: ChatListItemProps) {
  const [selected, setSelected] = useRecoilState(chatsState.isChatSelected(id));
  const { lastMessage, lastMessageAuthorName, name, photo, createdAt, online } =
    useRecoilValue(chatsState.chatInfo(id));
  const participant = useRecoilValue(chatsState.selfParticipantByChat(id));
  if (!participant) return null;
  console.log(participant);

  return (
    <React.Fragment>
      <ListItem>
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
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
            <AvatarWithStatus
              online={online}
              src={photo ?? undefined}
              size="lg"
              inset='.5rem'
            />
            <Stack spacing={0.25} width="100%">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography level="title-sm">{name}</Typography>
                <Box>
                  {participant.toReadPings !== 0 && (
                    <Icon
                      icon={faCircle}
                      sx={{ fontSize: 8, color: 'primary.plainColor' }}
                    />
                  )}
                  <Typography
                    level="body-xs"
                    display={{ xs: 'none', md: 'block' }}
                    noWrap
                  >
                    5 mins ago
                  </Typography>
                </Box>
              </Box>
              {lastMessage && (
                <Typography
                  level="body-sm"
                  component="span"
                  sx={{
                    whiteSpace: 'nowrap',
                    width: '40dvh',
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
