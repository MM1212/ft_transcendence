import { CircularProgress, Stack } from '@mui/joy';
import React from 'react';
import { useRecoilValue } from 'recoil';
import notificationsState, { useNotificationsTemplate } from '../state';
import NotificationsModel from '@typings/models/notifications';
import InboxNotification from './Notification';

function NotificationWrapper(
  props: NotificationsModel.Models.INotification
): JSX.Element {
  const template = useNotificationsTemplate(props.tag);
  if (template.CustomRenderer) return <template.CustomRenderer {...props} />;
  return <InboxNotification {...props} />;
}

function MountNotifications() {
  const notifications = useRecoilValue(notificationsState.all);
  return React.useMemo(
    () =>
      notifications.map((notification) => (
        <NotificationWrapper key={notification.id} {...notification} />
      )),
    [notifications]
  );
}

export default function NotificationsInbox(): JSX.Element {
  return (
    <Stack spacing={1} p={2} pt={1} flexGrow={1} overflow="auto">
      <React.Suspense
        fallback={<CircularProgress variant="plain" sx={{ m: 'auto' }} />}
      >
        <MountNotifications />
      </React.Suspense>
    </Stack>
  );
}
