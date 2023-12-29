import { useRecoilValueLoadable } from 'recoil';
import chatsState from '../state';
import { Chip } from '@mui/joy';
import { memo } from 'react';

const ChatMessagesSidebarDecoration = memo(
  function ChatMessagesSidebarDecoration() {
    const { contents: unreadPings, state } = useRecoilValueLoadable(
      chatsState.unreadPings
    );
    if (state !== 'hasValue') return null;
    if (unreadPings === 0) return null;
    return (
      <Chip
        variant="solid"
        size="sm"
        color="primary"
      >
        {unreadPings > 9 ? '9+' : unreadPings}
      </Chip>
    );
  }
);

export default ChatMessagesSidebarDecoration;
