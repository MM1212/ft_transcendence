import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import NewChatModal from './NewChat';

export default function MyProfile() {
  return (
    <Sheet
      sx={{
        flex: 1,
        width: '100%',
        mx: 'auto',
        pt: { xs: 'var(--Header-height)', sm: 0 },
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(min-content, min(30%, 40dvh)) 1fr',
        },
      }}
    >
      <ChatsPane />
      <MessagesPane />
      <NewChatModal />
    </Sheet>
  );
}
