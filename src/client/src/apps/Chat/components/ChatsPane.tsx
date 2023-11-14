import * as React from 'react';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, CircularProgress, IconButton, Input } from '@mui/joy';
import List from '@mui/joy/List';
import ChatListItem from './ChatListItem';
import { useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import { useModalActions } from '@hooks/useModal';
import PencilBoxIcon from '@components/icons/PencilBoxIcon';
import CancelIcon from '@components/icons/CancelIcon';
import MagnifyIcon from '@components/icons/MagnifyIcon';
import PlaylistEditIcon from '@components/icons/PlaylistEditIcon';

function ChatEntries() {
  const chatIds = useRecoilValue(chatsState.chatIds);
  return (
    <>
      {chatIds.map((id) => (
        <ChatListItem key={id} id={id} />
      ))}
    </>
  );
}

export default function ChatsPane() {
  const { open } = useModalActions('chat:new-chat');
  const unreadPings = useRecoilValue(chatsState.unreadPings);
  return (
    <Sheet
      sx={{
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100%',
        overflowY: 'auto',
        width: '35dvh',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        p={2}
        pb={1.5}
      >
        <Typography
          fontSize={{ xs: 'md', md: 'lg' }}
          component="h1"
          fontWeight="lg"
          endDecorator={
            unreadPings > 0 && (
              <Chip
                variant="soft"
                color="primary"
                size="md"
                slotProps={{ root: { component: 'span' } }}
              >
                {unreadPings}
              </Chip>
            )
          }
          sx={{ mr: 'auto' }}
        >
          Messages
        </Typography>

        <IconButton
          variant="plain"
          aria-label="edit"
          color="neutral"
          size="sm"
          sx={{ display: { xs: 'none', sm: 'unset' } }}
          onClick={open}
        >
          <PlaylistEditIcon />
        </IconButton>
      </Stack>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Input
          size="sm"
          startDecorator={<MagnifyIcon />}
          placeholder="Search"
          aria-label="Search"
        />
      </Box>
      <List
        sx={{
          py: 0,
          '--ListItem-paddingY': '0.75rem',
          '--ListItem-paddingX': '1rem',
        }}
      >
        <React.Suspense fallback={<CircularProgress />}>
          <ChatEntries />
        </React.Suspense>
      </List>
    </Sheet>
  );
}