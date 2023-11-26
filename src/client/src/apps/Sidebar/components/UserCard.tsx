import { useUpdateUserModalActions } from '@apps/Profile/hooks/useUpdateUserModal';
import { UserAvatar } from '@components/AvatarWithStatus';
import CircleIcon from '@components/icons/CircleIcon';
import LogoutIcon from '@components/icons/LogoutIcon';
import { useCurrentUser, useSessionActions } from '@hooks/user';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  styled,
} from '@mui/joy';
import { userStatusToColor, userStatusToString } from '@utils/userStatus';

function UserCardSkeleton(): JSX.Element {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Avatar>
        <Skeleton variant="circular" />
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Skeleton variant="text" level="title-sm" />
        <Skeleton variant="text" level="body-xs" />
      </Box>
      <IconButton size="sm" variant="plain" color="neutral" disabled>
        <LogoutIcon />
      </IconButton>
    </Box>
  );
}

const UserDataBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5),
  flex: 1,
  gap: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.radius.md,
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: theme.palette.background.level1,
    cursor: 'pointer',
    '& $avatar': {
      boxShadow: theme.shadow.xl,
    },
  },
}));

export default function SidebarUserCard(): JSX.Element {
  const user = useCurrentUser();
  const { logout } = useSessionActions();
  const { open } = useUpdateUserModalActions();
  if (!user) return <UserCardSkeleton />;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Tooltip title="Update Profile" enterDelay={1000}>
        <UserDataBox onClick={() => open()}>
          <UserAvatar src={user.avatar} size="sm" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-sm">{user.nickname}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CircleIcon
                size="xxs"
                sx={{
                  color: (theme) =>
                    theme.getCssVar(userStatusToColor(user.status)),
                }}
              />
              <Typography level="body-xs">
                {userStatusToString(user.status)}
              </Typography>
            </Stack>
          </Box>
        </UserDataBox>
      </Tooltip>
      <Tooltip title="Logout">
        <IconButton size="sm" variant="plain" color="neutral" onClick={logout}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
