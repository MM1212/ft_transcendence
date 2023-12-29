import InboxIcon from '@components/icons/InboxIcon';
import { IconButton, Sheet, Stack, Tooltip, Typography } from '@mui/joy';
import CheckAllIcon from '@components/icons/CheckAllIcon';
import NotificationsInbox from '../components/Inbox';
import { useRecoilValue } from 'recoil';
import notificationsState from '../state';
import React from 'react';
import tunnel from '@lib/tunnel';
import NotificationsModel from '@typings/models/notifications';
import notifications from '@lib/notifications/hooks';

export default function InboxView(): JSX.Element {
  const unreadCount = useRecoilValue(notificationsState.unreadCount);
  const [loading, setLoading] = React.useState(false);
  const markAllAsRead = React.useCallback(async () => {
    try {
      setLoading(true);
      await tunnel.post(
        NotificationsModel.Endpoints.Targets.MarkAllAsRead,
        undefined
      );
    } catch (error) {
      notifications.error(
        'Failed to mark all as read',
        (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    <Sheet
      sx={{
        height: '100%',
        width: '45dvh',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        m={2}
        mb={1}
        justifyContent="space-between"
      >
        <Typography level="h3" startDecorator={<InboxIcon />}>
          Inbox
        </Typography>
        <Tooltip title="Mark All as Read">
          <IconButton
            size="sm"
            color="primary"
            variant="soft"
            sx={{
              borderRadius: 'lg',
            }}
            disabled={loading || unreadCount === 0}
            onClick={markAllAsRead}
          >
            <CheckAllIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <NotificationsInbox />
    </Sheet>
  );
}
