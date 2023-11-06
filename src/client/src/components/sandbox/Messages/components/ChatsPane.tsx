import * as React from 'react';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, CircularProgress, IconButton, Input } from '@mui/joy';
import List from '@mui/joy/List';
import ChatListItem from './ChatListItem';
import { toggleMessagesPane } from '../utils';
import { useRecoilValue } from 'recoil';
import chatsState from '../state';
import { useModalActions } from '@hooks/useModal';
import PencilBoxIcon from '@components/icons/PencilBoxIcon';
import CancelIcon from '@components/icons/CancelIcon';
import MagnifyIcon from '@components/icons/MagnifyIcon';

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
  return (
    <Sheet
      sx={{
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100%',
        overflowY: 'auto',
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
            <Chip
              variant="soft"
              color="primary"
              size="md"
              slotProps={{ root: { component: 'span' } }}
            >
              4
            </Chip>
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
          <PencilBoxIcon />
        </IconButton>

        <IconButton
          variant="plain"
          aria-label="edit"
          color="neutral"
          size="sm"
          onClick={() => {
            toggleMessagesPane();
          }}
          sx={{ display: { sm: 'none' } }}
        >
          <CancelIcon />
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
