import InboxIcon from '@components/icons/InboxIcon';
import { IconButton, Sheet, Stack, Tooltip, Typography } from '@mui/joy';
import CheckAllIcon from '@components/icons/CheckAllIcon';
import NotificationsInbox from '../components/Inbox';
import { useRecoilValue } from 'recoil';
import notificationsState from '../state';

export default function InboxView(): JSX.Element {
  const unreadCount = useRecoilValue(notificationsState.unreadCount);
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
            disabled={unreadCount === 0}
          >
            <CheckAllIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <NotificationsInbox />
    </Sheet>
  );
}
