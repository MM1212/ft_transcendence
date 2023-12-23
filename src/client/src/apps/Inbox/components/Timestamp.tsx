import CloseIcon from '@components/icons/CloseIcon';
import { Typography, Tooltip, IconButton } from '@mui/joy';
import NotificationsModel from '@typings/models/notifications';
import moment from 'moment';

export default function NotificationTimestamp({
  createdAt,
}: Pick<NotificationsModel.Models.INotification, 'createdAt'>): JSX.Element {
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
        mr: 0.5,
      }}
      endDecorator={
        <Tooltip title="Dismiss">
          <IconButton
            size="xs"
            color="neutral"
            variant="plain"
            onClick={(e) => e.stopPropagation()}
          >
            <CloseIcon size="xs" />
          </IconButton>
        </Tooltip>
      }
    >
      {moment(createdAt).fromNow()}
    </Typography>
  );
}
