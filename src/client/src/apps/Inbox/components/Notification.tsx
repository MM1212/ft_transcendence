import { Box } from '@mui/joy';
import { UnReadAlert } from './UnReadAlert';
import NotificationBody from './Body';
import { NotificationWrapper } from './Wrapper';
import NotificationsModel from '@typings/models/notifications';
import NotificationTimestamp from './Timestamp';
import NotificationOptions from './Options';
import { useNotificationsTemplate } from '../state';
import { navigate } from 'wouter/use-location';
import useNotificationActions from '../state/hooks/useNotificationActions';
import React from 'react';

export default function InboxNotification(
  props: NotificationsModel.Models.INotification
): JSX.Element {
  const template = useNotificationsTemplate(props.tag);
  const { markAsRead } = useNotificationActions(props.id);
  const attemptToRoute = () => {
    if (!template.routeTo) return;
    navigate(template.routeTo);
    markAsRead();
  };
  return (
    <NotificationWrapper
      read={props.read}
      // @ts-expect-error impl
      href={template.routeTo}
      onClick={attemptToRoute}
    >
      {!props.read && <UnReadAlert />}
      <NotificationBody {...props} />
      <Box display="flex" alignItems="flex-end">
        <NotificationTimestamp createdAt={props.createdAt} id={props.id} dismissable={props.dismissable} />
        <NotificationOptions {...props} dismissable={props.dismissable} />
      </Box>
    </NotificationWrapper>
  );
}
