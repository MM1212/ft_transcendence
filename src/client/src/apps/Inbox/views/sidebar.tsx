import { useRecoilValueLoadable } from 'recoil';
import { Chip } from '@mui/joy';
import { memo } from 'react';
import notificationsState from '../state';

const InboxUnreadSidebarDecoration = memo(
  function InboxUnreadSidebarDecoration() {
    const { contents: unreadPings, state } = useRecoilValueLoadable(
      notificationsState.unreadCount
    );
    if (state !== 'hasValue') return null;
    if (unreadPings === 0) return null;
    return (
      <Chip variant="solid" size="sm" color="primary">
        {unreadPings > 9 ? '9+' : unreadPings}
      </Chip>
    );
  }
);

export default InboxUnreadSidebarDecoration;
