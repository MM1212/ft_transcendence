import CloseIcon from '@components/icons/CloseIcon';
import { Typography, Tooltip, IconButton } from '@mui/joy';
import NotificationsModel from '@typings/models/notifications';
import moment from 'moment';
import useNotificationActions from '../state/hooks/useNotificationActions';

export default function NotificationTimestamp({
  createdAt,
  id,
  dismissable,
}: Pick<NotificationsModel.Models.INotification, 'createdAt' | 'id'> & {
  dismissable: boolean;
}): JSX.Element {
  const { dismiss } = useNotificationActions(id);
  return (
    <Typography
      level="body-xs"
      fontSize="xs"
      sx={{
        textWrap: 'nowrap',
        position: 'absolute',
        top: 0,
        right: 0,
        mt: 0.5,
        mr: dismissable ? 0.5 : 1,
      }}
      endDecorator={
        dismissable ? (
          <Tooltip title="Dismiss">
            <IconButton
              size="xs"
              color="neutral"
              variant="plain"
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
            >
              <CloseIcon size="xs" />
            </IconButton>
          </Tooltip>
        ) : (
          false
        )
      }
    >
      {moment(createdAt).fromNow()}
    </Typography>
  );
}
