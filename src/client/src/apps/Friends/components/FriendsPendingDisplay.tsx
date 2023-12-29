import { useUser } from '@hooks/user';
import { Stack, Typography, IconButton } from '@mui/joy';
import { UserAvatar } from '@components/AvatarWithStatus';
import UsersModel from '@typings/models/users';
import useNotificationActions from '@apps/Inbox/state/hooks/useNotificationActions';
import CheckIcon from '@components/icons/CheckIcon';
import CloseIcon from '@components/icons/CloseIcon';

export default function FriendPendingDisplay({
  notif,
}: {
  notif: UsersModel.DTO.FriendRequestNotification;
}): JSX.Element | null {
  const {
    data: { type, uId },
  } = notif;
  const user = useUser(uId);
  const { performAction } = useNotificationActions(notif.id);
  if (!user) return null;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1.5}
      key={user.id}
      sx={{
        width: '100%',
        borderRadius: (theme) => theme.radius.sm,
        p: 1,
        transition: (theme) => theme.transitions.create('background-color', {}),
        '&:hover': {
          backgroundColor: 'background.level1',
          cursor: 'pointer',
        },
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <UserAvatar src={user.avatar} size="lg" />
        <Stack>
          <Typography level="title-md">{user.nickname}</Typography>
          <Typography level="body-xs">
            {type === 'receiver' ? 'Incoming' : 'Outgoing'} Friend Request
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" ml="auto">
        {type === 'receiver' ? (
          <>
            <IconButton
              color="success"
              variant="plain"
              sx={{
                borderRadius: 'xl',
              }}
              onClick={() => performAction('accept')}
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              color="danger"
              sx={{
                borderRadius: 'xl',
              }}
              onClick={() => performAction('decline')}
            >
              <CloseIcon />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton
              onClick={() => performAction('cancel')}
              color="neutral"
              variant="plain"
              sx={{ borderRadius: 'xl' }}
            >
              <CloseIcon />
            </IconButton>
          </>
        )}
      </Stack>
    </Stack>
  );
}
