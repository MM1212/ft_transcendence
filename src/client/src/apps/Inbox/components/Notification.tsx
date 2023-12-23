import { Box } from '@mui/joy';
import { UnReadAlert } from './UnReadAlert';
import NotificationBody from './Body';
import { NotificationWrapper } from './Wrapper';
import NotificationsModel from '@typings/models/notifications';
import NotificationTimestamp from './Timestamp';
import NotificationOptions from './Options';
import { useNotificationsTemplate } from '../state';
import { navigate } from 'wouter/use-location';

export default function InboxNotification(
  props: NotificationsModel.Models.INotification
): JSX.Element {
  const template = useNotificationsTemplate(props.tag);

  const attemptToRoute = () => {
    if (!template.routeTo) return;
    navigate(template.routeTo);
  };
  return (
    <NotificationWrapper
      read={props.read}
      // @ts-expect-error impl
      href={template.routeTo}
      onClick={attemptToRoute}
    >
      <UnReadAlert />
      <NotificationBody {...props} />
      <Box display="flex" alignItems="flex-end">
        <NotificationTimestamp createdAt={props.createdAt} />
        <NotificationOptions {...props} />
      </Box>
    </NotificationWrapper>
  );
}
